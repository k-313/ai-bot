from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.tasks import router as tasks_router
from app.api.approvals import router as approvals_router
from app.api.documents import router as documents_router
from app.api.files import router as files_router
from app.api.memory import router as memory_router
from app.api.settings import router as settings_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(chat_router)
api_router.include_router(tasks_router)
api_router.include_router(approvals_router)
api_router.include_router(documents_router)
api_router.include_router(files_router)
api_router.include_router(memory_router)
api_router.include_router(settings_router)
