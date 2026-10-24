import pytest
import pytest_asyncio
from pathlib import Path
from httpx import AsyncClient, ASGITransport

from app.config import settings
from app.database.session import init_db
from app.security.path_validator import validate_and_resolve_path, SecurityPathError
from app.security.sanitizer import redact_secrets
from app.orchestrator.orchestrator import orchestrator
from app.tools.document_generator import generate_pptx_file, generate_docx_file, generate_pdf_file
from app.tools.registry import execute_tool
from main import app

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "operational"
        assert "version" in data
        assert "workspace_dir" in data

def test_path_traversal_protection():
    valid_path = validate_and_resolve_path("test.txt", allow_output=True)
    assert valid_path.parent == settings.WORKSPACE_DIR

    with pytest.raises(SecurityPathError):
        validate_and_resolve_path("../../Windows/System32/cmd.exe", allow_output=False)

def test_secret_redaction():
    raw_text = "My secret token is sk-1234567890abcdef1234567890 and Bearer secret_token_xyz_987654321"
    clean = redact_secrets(raw_text)
    assert "sk-1234567890" not in clean
    assert "[REDACTED_SECRET]" in clean

def test_intent_routing():
    assert orchestrator.route_intent("Create a PowerPoint presentation on AI") == "document_agent"
    assert orchestrator.route_intent("Fix this python bug in module.py") == "coding_agent"
    assert orchestrator.route_intent("Search for latest papers on transformer attention") == "research_agent"
    assert orchestrator.route_intent("Launch notepad app") == "desktop_agent"
    assert orchestrator.route_intent("Create a study revision schedule for OS exam") == "study_agent"
    assert orchestrator.route_intent("Write a GenBloc marketing pitch") == "genbloc_agent"
    assert orchestrator.route_intent("Hello how are you?") == "general"

def test_document_generators_integrity():
    pptx_res = generate_pptx_file(
        title="Test Presentation",
        subtitle="Verification Slide",
        slides=[{"title": "Slide 1", "bullets": ["Point A", "Point B"]}],
        filename="test_verify.pptx"
    )
    assert pptx_res["status"] == "success"
    assert Path(pptx_res["path"]).exists()
    assert Path(pptx_res["path"]).stat().st_size > 0

    docx_res = generate_docx_file(
        title="Test Document",
        sections=[{"heading": "Section 1", "content": "Paragraph content", "bullets": ["Item 1"]}],
        filename="test_verify.docx"
    )
    assert docx_res["status"] == "success"
    assert Path(docx_res["path"]).exists()
    assert Path(docx_res["path"]).stat().st_size > 0

    pdf_res = generate_pdf_file(
        title="Test PDF Report",
        sections=[{"heading": "Summary", "content": "PDF report text", "bullets": ["Verified"]}],
        filename="test_verify.pdf"
    )
    assert pdf_res["status"] == "success"
    assert Path(pdf_res["path"]).exists()
    assert Path(pdf_res["path"]).stat().st_size > 0

def test_tool_execution():
    time_res = execute_tool("get_time_and_date", {})
    assert time_res.success is True
    assert "formatted" in time_res.data

    bad_res = execute_tool("non_existent_tool", {})
    assert bad_res.success is False

@pytest.mark.asyncio
async def test_chat_and_persistence():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        req = {"message": "Create a study plan for algorithms"}
        resp = await ac.post("/api/chat", json=req)
        assert resp.status_code == 200
        data = resp.json()
        assert data["agent"] == "study_agent"
        assert data["status"] == "completed"
        conv_id = data["conversation_id"]

        hist_resp = await ac.get(f"/api/chat/conversations/{conv_id}")
        assert hist_resp.status_code == 200
        hist_data = hist_resp.json()
        assert len(hist_data["messages"]) >= 2
