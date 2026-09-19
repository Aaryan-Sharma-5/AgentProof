"""
Multi-Layer Verification Agent.
Orchestrates transport, schema, requirement, completeness, freshness,
and semantic LLM verification stages into a final decision.
"""

from __future__ import annotations
from typing import Dict, Any, Optional, List
from app.schemas.intent import StructuredIntent
from app.models.domain import ApiRecord, VerificationStatus
from app.schemas.verification import (
    VerificationResult,
    TransportCheckResult,
    SchemaCheckResult,
    RequirementCheckResult,
    SemanticCheckResult,
)
from app.agents.verification.deterministic import DeterministicVerifier
from app.agents.verification.semantic import SemanticVerifier


class VerificationAgent:
    """Combines deterministic checks and semantic AI verification."""

    def __init__(
        self,
        deterministic_verifier: Optional[DeterministicVerifier] = None,
        semantic_verifier: Optional[SemanticVerifier] = None,
    ):
        self.deterministic = deterministic_verifier or DeterministicVerifier()
        self.semantic = semantic_verifier or SemanticVerifier()

    async def verify(
        self,
        raw_user_request: str,
        intent: StructuredIntent,
        api: ApiRecord,
        http_status: int,
        content_type: str,
        response_size_bytes: int,
        elapsed_ms: float,
        api_data: Dict[str, Any],
    ) -> VerificationResult:
        issues: List[str] = []

        # Layer 1: Transport Check
        transport_res = self.deterministic.check_transport(
            http_status=http_status,
            content_type=content_type,
            size_bytes=response_size_bytes,
            elapsed_ms=elapsed_ms
        )
        if not transport_res.passed:
            issues.append(transport_res.error or "Transport check failed")
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=0.99,
                transport_check=transport_res,
                issues=issues,
                summary=f"Verification failed at Layer 1 (Transport): {transport_res.error}"
            )

        # Layer 2: Schema Check
        schema_res = self.deterministic.check_schema(
            data=api_data,
            expected_schema=api.output_schema,
            intent_required_fields=intent.required_fields
        )
        if not schema_res.passed:
            issues.append(schema_res.error or "Schema validation failed")
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=0.98,
                transport_check=transport_res,
                schema_check=schema_res,
                issues=issues,
                summary=f"Verification failed at Layer 2 (Schema): {schema_res.error}"
            )

        # Layer 3, 4, 5: Requirement, Completeness, Freshness, and Anomaly Checks
        req_res = self.deterministic.check_requirement(
            data=api_data,
            intent=intent
        )
        if not req_res.passed:
            issues.extend(req_res.issues)
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=0.97,
                transport_check=transport_res,
                schema_check=schema_res,
                requirement_check=req_res,
                issues=issues,
                summary="Verification failed at Layer 3 (Requirement Constraints): " + "; ".join(req_res.issues)
            )

        # Layer 6: Semantic LLM Verification
        semantic_res = await self.semantic.verify_semantic(
            raw_user_request=raw_user_request,
            intent=intent,
            api_data=api_data
        )
        if semantic_res.is_prompt_injection_detected:
            issues.extend(semantic_res.issues)
            return VerificationResult(
                status=VerificationStatus.FAILED,
                confidence=1.0,
                transport_check=transport_res,
                schema_check=schema_res,
                requirement_check=req_res,
                semantic_check=semantic_res,
                issues=issues,
                summary="Verification failed due to prompt injection in external data payload."
            )

        if not semantic_res.verified:
            issues.extend(semantic_res.issues)
            return VerificationResult(
                status=VerificationStatus.REQUIRES_REVIEW if semantic_res.confidence < 0.70 else VerificationStatus.FAILED,
                confidence=semantic_res.confidence,
                transport_check=transport_res,
                schema_check=schema_res,
                requirement_check=req_res,
                semantic_check=semantic_res,
                issues=issues,
                summary=f"Verification failed at Layer 6 (Semantic Analysis): {semantic_res.reason}"
            )

        # All checks passed!
        return VerificationResult(
            status=VerificationStatus.VERIFIED,
            confidence=round(min(0.99, semantic_res.confidence), 2),
            transport_check=transport_res,
            schema_check=schema_res,
            requirement_check=req_res,
            semantic_check=semantic_res,
            issues=[],
            summary="All verification layers (Transport, Schema, Requirement, Freshness, Semantic) passed successfully."
        )
