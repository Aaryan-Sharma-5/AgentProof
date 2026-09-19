"""
Deterministic Verification Layers.
Performs transport, schema, requirement constraint, completeness, freshness,
and anomaly checks on API responses without calling an LLM.
"""

from __future__ import annotations
import time
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.intent import StructuredIntent
from app.config.settings import settings
from app.models.domain import ApiRecord, VerificationStatus
from app.schemas.verification import (
    TransportCheckResult,
    SchemaCheckResult,
    RequirementCheckResult,
)


class DeterministicVerifier:
    """Executes rule-based and structural verification checks."""

    def check_transport(
        self,
        http_status: int,
        content_type: str,
        size_bytes: int,
        elapsed_ms: float,
    ) -> TransportCheckResult:
        passed = (200 <= http_status < 300)
        error = None if passed else f"HTTP status {http_status} not successful"
        return TransportCheckResult(
            passed=passed,
            status_code=http_status,
            content_type=content_type,
            response_size_bytes=size_bytes,
            elapsed_ms=elapsed_ms,
            error=error
        )

    def check_schema(
        self,
        data: Any,
        expected_schema: Dict[str, Any],
        intent_required_fields: List[str],
    ) -> SchemaCheckResult:
        if not isinstance(data, dict):
            return SchemaCheckResult(
                passed=False,
                is_valid_json=True,
                error="Response root must be a JSON object"
            )

        missing_fields = []
        # Check required fields from intent and schema
        required = set(intent_required_fields)
        if "required" in expected_schema:
            required.update(expected_schema["required"])

        for f in required:
            if f not in data or data[f] is None:
                missing_fields.append(f)

        passed = len(missing_fields) == 0
        error = f"Missing required fields: {missing_fields}" if not passed else None

        return SchemaCheckResult(
            passed=passed,
            is_valid_json=True,
            missing_fields=missing_fields,
            error=error
        )

    def check_requirement(
        self,
        data: Dict[str, Any],
        intent: StructuredIntent,
    ) -> RequirementCheckResult:
        issues: List[str] = []
        target_matched = True
        location_matched = True
        freshness_matched = True

        # 1. Location Constraint Check (e.g. Mumbai vs Delhi)
        if intent.location:
            intent_loc = intent.location.strip().lower()
            # Check for city/location in data
            resp_loc = (
                data.get("city")
                or data.get("location")
                or data.get("place")
                or ""
            )
            if resp_loc:
                if intent_loc not in str(resp_loc).strip().lower():
                    location_matched = False
                    issues.append(
                        f"Location mismatch: Requested '{intent.location}', but provider returned '{resp_loc}'."
                    )

        # 2. Target Constraint Check (e.g. BTC vs ETH)
        if intent.target and intent.category == "crypto_price":
            target_upper = intent.target.upper()
            resp_asset = (
                data.get("asset")
                or data.get("symbol")
                or data.get("target")
                or data.get("currency")
                or ""
            )
            if resp_asset and (target_upper != str(resp_asset).upper()):
                target_matched = False
                issues.append(
                    f"Target asset mismatch: Requested '{target_upper}', but provider returned '{resp_asset}'."
                )

        # 3. Canonical Demo Competitor Pricing Check (10 records required for evaluation)
        if intent.category == "competitor_pricing":
            records = data.get("records")
            if not isinstance(records, list) or len(records) == 0:
                issues.append("Competitor pricing records missing or empty.")
            elif len(records) != 10:
                issues.append(f"Canonical demo requires 10 pricing records, received {len(records)}.")

        # 4. Freshness Check
        if settings.enforce_freshness and intent.freshness == "current" and "timestamp" in data:
            ts_val = data["timestamp"]
            # Check age if integer epoch or isoformat
            try:
                if isinstance(ts_val, (int, float)):
                    age_seconds = abs(time.time() - ts_val)
                    if age_seconds > settings.freshness_max_age_seconds:
                        freshness_matched = False
                        issues.append(f"Data is stale: timestamp age is {age_seconds / 3600:.1f} hours.")
                elif isinstance(ts_val, str):
                    dt = datetime.fromisoformat(ts_val.replace("Z", "+00:00"))
                    age_seconds = abs(datetime.now(timezone.utc).timestamp() - dt.timestamp())
                    if age_seconds > settings.freshness_max_age_seconds:
                        freshness_matched = False
                        issues.append(f"Data is stale: timestamp age is {age_seconds / 3600:.1f} hours.")
            except Exception:
                pass

        # 5. Anomaly Detection
        if "price" in data:
            try:
                price = float(data["price"])
                if math.isnan(price) or math.isinf(price):
                    issues.append("Anomaly: Price field is NaN or infinite.")
                elif price <= 0:
                    issues.append(f"Anomaly: Price {price} is non-positive.")
            except (ValueError, TypeError):
                issues.append("Anomaly: Price field is not a numeric value.")

        if "temperature" in data:
            try:
                temp = float(data["temperature"])
                if math.isnan(temp) or math.isinf(temp):
                    issues.append("Anomaly: Temperature field is NaN or infinite.")
                elif temp < -100 or temp > 70:
                    issues.append(f"Anomaly: Extreme unrealistic temperature {temp}°C.")
            except (ValueError, TypeError):
                issues.append("Anomaly: Temperature field is not numeric.")

        passed = len(issues) == 0
        return RequirementCheckResult(
            passed=passed,
            target_matched=target_matched,
            location_matched=location_matched,
            freshness_matched=freshness_matched,
            issues=issues
        )
