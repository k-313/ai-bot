import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings
from app.schemas.common import DocumentGenerateRequest
from app.tools.document_generator import generate_pptx_file, generate_docx_file, generate_pdf_file

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/generate")
async def generate_document(req: DocumentGenerateRequest):
    fname = req.filename or f"doc_{uuid.uuid4().hex[:8]}"
    doc_type = req.doc_type.lower().strip()

    try:
        if doc_type in ["pptx", "powerpoint", "presentation"]:
            res = generate_pptx_file(
                title=req.title,
                subtitle=req.subtitle or "",
                slides=req.slides or [
                    {"title": "Overview", "bullets": ["Context and objectives", "Core milestones", "Execution roadmap"]},
                    {"title": "Architecture", "bullets": ["Multi-agent coordination", "Granular permissions", "Reliable storage"]},
                    {"title": "Next Steps", "bullets": ["Deploy release build", "Integrate telemetry", "User feedback"]}
                ],
                filename=fname
            )
        elif doc_type in ["docx", "word"]:
            res = generate_docx_file(
                title=req.title,
                sections=req.sections or [
                    {
                        "heading": "Introduction",
                        "content": "This document was dynamically compiled and verified by JARVIS.",
                        "bullets": ["Autonomous task planning", "Controlled tool execution", "Integrity verified"]
                    }
                ],
                filename=fname
            )
        elif doc_type in ["pdf"]:
            res = generate_pdf_file(
                title=req.title,
                sections=req.sections or [
                    {
                        "heading": "Executive Summary",
                        "content": "This report details system status, technical deliverables, and active milestones.",
                        "bullets": ["Phase 1 & Phase 2 Complete", "Verified SQLite persistence", "Real document generator"]
                    }
                ],
                filename=fname
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported document type: {doc_type}")

        return res

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_documents():
    docs = []
    for item in settings.OUTPUT_DIR.glob("*.*"):
        if item.is_file() and item.suffix.lower() in [".pptx", ".docx", ".pdf"]:
            docs.append({
                "name": item.name,
                "path": str(item),
                "extension": item.suffix.lower().replace(".", ""),
                "size_bytes": item.stat().st_size,
                "created_at": datetime.fromtimestamp(item.stat().st_ctime, timezone.utc).isoformat(),
            })
    return docs

@router.get("/download/{filename}")
async def download_document(filename: str):
    file_path = (settings.OUTPUT_DIR / filename).resolve()
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(path=file_path, filename=filename)
