from fastapi import APIRouter
from app.config import settings
from app.schemas.common import SettingsUpdateRequest
from app.security.permissions import ACTION_REGISTRY

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_settings():
    masked_key = ""
    if settings.OPENAI_API_KEY:
        masked_key = settings.OPENAI_API_KEY[:4] + "..." + settings.OPENAI_API_KEY[-4:] if len(settings.OPENAI_API_KEY) > 8 else "***"

    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "openai_api_key_masked": masked_key,
        "openai_model": settings.OPENAI_MODEL,
        "workspace_dir": str(settings.WORKSPACE_DIR),
        "output_dir": str(settings.OUTPUT_DIR),
        "host": settings.HOST,
        "port": settings.PORT,
        "allowed_extensions": settings.ALLOWED_EXTENSIONS,
        "approved_applications": settings.APPROVED_APPLICATIONS,
    }

@router.post("")
async def update_settings(req: SettingsUpdateRequest):
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key.strip()
    if req.openai_model is not None:
        settings.OPENAI_MODEL = req.openai_model.strip()
    
    return {
        "success": True,
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "openai_model": settings.OPENAI_MODEL
    }

@router.get("/permissions")
async def get_permissions():
    actions = []
    for name, spec in ACTION_REGISTRY.items():
        actions.append({
            "action_name": spec.action_name,
            "level": spec.required_level.value,
            "risk_level": spec.risk_level.value,
            "description": spec.description,
            "requires_explicit_approval": spec.requires_explicit_approval
        })
    return {
        "permission_levels": [
            {"id": "level_1_read", "name": "Level 1 — Read & Analyze", "desc": "Inspect files, read documents, web research."},
            {"id": "level_2_create", "name": "Level 2 — Create", "desc": "Generate documents, presentations, notes, code in approved folders."},
            {"id": "level_3_modify_execute", "name": "Level 3 — Modify & Execute", "desc": "Run approved tests, execute commands, launch approved apps."},
            {"id": "level_4_sensitive", "name": "Level 4 — Sensitive / External", "desc": "Delete files, modify core security settings."}
        ],
        "registered_actions": actions
    }
