"""
Security and Prompt Injection Defense Module.
Implements detection and sanitization for malicious prompts and untrusted inputs.
Strictly isolates system instructions from untrusted user and API data.
"""

from __future__ import annotations
import re
from typing import Tuple, List

# Patterns indicative of prompt injection attempts
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s*prompt",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"dan\s+mode",
    r"jailbreak",
    r"bypass\s+(all\s+)?(filters|limits|policy)",
    r"send\s+all\s+(funds|mon|eth)",
    r"transfer\s+all\s+funds",
    r"override\s+policy",
    r"execute\s+arbitrary",
    r"reveal\s+(the\s+)?(private\s+key|secret|api_key)",
]

COMPILED_INJECTION_RE = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def detect_prompt_injection(text: str) -> Tuple[bool, List[str]]:
    """
    Evaluates input text for prompt injection and jailbreak patterns.
    Returns (is_suspicious, matched_patterns).
    """
    if not text:
        return False, []

    matches = []
    for regex in COMPILED_INJECTION_RE:
        if regex.search(text):
            matches.append(regex.pattern)

    return len(matches) > 0, matches


def sanitize_for_prompt(untrusted_data: str, max_chars: int = 4000) -> str:
    """
    Sanitizes untrusted text before placing it into LLM prompt templates.
    Wraps it in XML-like untrusted data delimiters and truncates excess length.
    """
    if not untrusted_data:
        return ""

    truncated = untrusted_data[:max_chars]
    # Neutralize prompt-escaping markers
    sanitized = (
        truncated.replace("<script>", "")
        .replace("</script>", "")
        .replace("```json", "'''json")
        .replace("```", "'''")
    )
    return sanitized
