from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    return HealthResponse(
        status="operational",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        workspace_dir=str(settings.WORKSPACE_DIR),
        output_dir=str(settings.OUTPUT_DIR),
        database="connected",
        openai_configured=bool(settings.OPENAI_API_KEY.strip()),
        model=settings.OPENAI_MODEL
    )
