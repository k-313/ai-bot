import re

SECRET_PATTERNS = [
    r"sk-[a-zA-Z0-9_-]{20,}",                # OpenAI / modern tokens
    r"Bearer\s+[a-zA-Z0-9_\-\.]{20,}",      # Bearer tokens
    r"key-[a-zA-Z0-9]{20,}",                 # Generic API keys
    r"ghp_[a-zA-Z0-9]{36}",                  # GitHub personal access tokens
    r"(?i)(password|secret|apikey|api_key)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-\.]{8,})['\"]?",
]

def redact_secrets(text: str) -> str:
    """Scan and redact known secret formats from text, logs, and error messages."""
    if not text:
        return text
    
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = re.sub(pattern, "[REDACTED_SECRET]", redacted)
    return redacted
