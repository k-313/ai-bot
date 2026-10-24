import os
from pathlib import Path
from typing import Optional
from app.config import settings

class SecurityPathError(Exception):
    """Raised when a path fails security validation."""
    pass

def get_approved_roots() -> list[Path]:
    """Return all approved directory roots for file operations."""
    return [settings.WORKSPACE_DIR.resolve(), settings.OUTPUT_DIR.resolve()]

def validate_and_resolve_path(path_str: str, allow_output: bool = True) -> Path:
    """
    Validate that the requested path does not escape approved directories
    and is safe from traversal attacks.
    """
    if not path_str or not path_str.strip():
        raise SecurityPathError("Path cannot be empty.")
    
    clean_str = path_str.strip().replace("\\", "/")
    
    try:
        target = Path(clean_str)
        if not target.is_absolute():
            target = (settings.WORKSPACE_DIR / target).resolve()
        else:
            target = target.resolve()
    except Exception as e:
        raise SecurityPathError(f"Invalid path structure: {e}")

    approved_roots = get_approved_roots() if allow_output else [settings.WORKSPACE_DIR.resolve()]
    
    is_safe = False
    for root in approved_roots:
        try:
            target.relative_to(root)
            is_safe = True
            break
        except ValueError:
            continue
            
    if not is_safe:
        raise SecurityPathError(
            f"Access denied: '{path_str}' resolves outside approved directories: "
            f"{[str(r) for r in approved_roots]}"
        )

    return target

def validate_extension(path: Path) -> bool:
    """Verify that file extension is in the allowed list."""
    if not path.suffix:
        return True
    return path.suffix.lower() in settings.ALLOWED_EXTENSIONS
