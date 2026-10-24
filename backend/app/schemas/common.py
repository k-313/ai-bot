from pydantic import BaseModel
from typing import Any, Optional

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    workspace_dir: str
    output_dir: str
    database: str
    openai_configured: bool
    model: str

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    context: Optional[dict[str, Any]] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: str
    content: str
    agent: str
    task_id: Optional[str] = None
    output_files: list[str] = []
    status: str

class TaskItemResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    agent_name: str
    progress: int
    result: Optional[str] = None
    error: Optional[str] = None
    created_at: str

class ApprovalActionRequest(BaseModel):
    approval_id: str
    decision: str

class DocumentGenerateRequest(BaseModel):
    doc_type: str
    title: str
    subtitle: Optional[str] = ""
    filename: Optional[str] = None
    sections: Optional[list[dict[str, Any]]] = None
    slides: Optional[list[dict[str, Any]]] = None

class MemoryCreateRequest(BaseModel):
    category: str = "general"
    key: str
    value: str
    relevance: float = 1.0

class SettingsUpdateRequest(BaseModel):
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    workspace_dir: Optional[str] = None
    output_dir: Optional[str] = None
