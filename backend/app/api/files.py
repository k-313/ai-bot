from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pathlib import Path
from datetime import datetime, timezone

from app.config import settings
from app.security.path_validator import validate_and_resolve_path, validate_extension, SecurityPathError

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/roots")
async def get_roots():
    return {
        "workspace": str(settings.WORKSPACE_DIR),
        "output": str(settings.OUTPUT_DIR),
        "allowed_extensions": settings.ALLOWED_EXTENSIONS,
    }

@router.get("")
async def list_files(folder: str = "workspace"):
    target_root = settings.OUTPUT_DIR if folder == "output" else settings.WORKSPACE_DIR
    results = []
    
    for item in target_root.rglob("*"):
        if item.is_file():
            rel = item.relative_to(target_root)
            results.append({
                "name": item.name,
                "relative_path": str(rel),
                "absolute_path": str(item),
                "size_bytes": item.stat().st_size,
                "extension": item.suffix.lower(),
                "modified_at": datetime.fromtimestamp(item.stat().st_mtime, timezone.utc).isoformat()
            })
    return results

@router.get("/preview")
async def preview_file(path: str = Query(...)):
    try:
        target = validate_and_resolve_path(path, allow_output=True)
    except SecurityPathError as e:
        raise HTTPException(status_code=403, detail=str(e))

    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    if not target.is_file():
        raise HTTPException(status_code=400, detail="Target is not a file")

    try:
        with open(target, "r", encoding="utf-8", errors="replace") as f:
            content = f.read(20000)
        return {
            "name": target.name,
            "path": str(target),
            "size_bytes": target.stat().st_size,
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {e}")
