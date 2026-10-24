# JARVIS — Personal Windows AI Desktop Assistant

An autonomous, permission-based personal AI desktop assistant built specifically for Windows developers, computer science students, and founders.

JARVIS coordinates specialist agents to handle **coding, college study roadmaps, PowerPoint/PDF/Word document synthesis, academic research, desktop automation, and GenBloc business workflows** while keeping full authority in the hands of the user.

---

## 🌟 Key Features

- **Futuristic AI Desktop Interface:** Dark navy aesthetic with neon blue, cyan, and violet accents, subtle glass cards, glow states, and animated voice waveforms.
- **12 Comprehensive Workspaces:**
  1. **Home Dashboard:** System status, quick actions, pending jobs, and metric cards.
  2. **AI Chat & Voice:** Persistent conversations, push-to-talk voice input, and output file attachments.
  3. **Autonomous Approval Center:** Dedicated human-in-the-loop review for Level 3/4 sensitive operations.
  4. **Agent Workspace:** 8 specialist agents (Orchestrator, Coding, Document, Research, Desktop, Study, GenBloc, Memory).
  5. **Task Manager:** SQLite-backed durable ledger tracking job progress, substeps, cancellation, and emergency stop.
  6. **Files Workspace:** Safe file browser (`workspace/` and `output/`) with text preview and direct document studio.
  7. **Code Assistant:** Traceback error diagnosis, code generation, and authorized test suite runner (`pytest`).
  8. **Research Engine:** Fact synthesis with citation sources and structured output.
  9. **College Hub:** Subject organizers and spaced-repetition revision schedules in PDF format.
  10. **GenBloc Suite:** Business development plans, investor pitch decks, and social media copy in Word/DOCX.
  11. **Memory Vault:** Persistent context storage with automatic secret redaction.
  12. **Settings:** Masked API keys, configurable models (`gpt-4o`, `gpt-4o-mini`, `o1`), and directory boundaries.
- **Real Document Generators:** Native generation and disk verification of `.pptx` (PowerPoint), `.docx` (Word), and `.pdf` files.
- **Enterprise-Grade Security:**
  - Canonical path resolution preventing path traversal (`../`) outside approved directories.
  - Strict command and application allowlists (`notepad.exe`, `calc.exe`, `explorer.exe`).
  - Emergency Stop button halting all running tasks immediately.
  - Localhost-only binding (`127.0.0.1`).
  - API keys stored strictly on the local backend, never exposed in client bundles.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│               JARVIS Desktop Shell (Tauri 2 / React)            │
│               TypeScript • Vite • Tailwind CSS • Lucide         │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON API (Port 8000)
┌────────────────────────────────▼────────────────────────────────┐
│               JARVIS Core Backend (FastAPI / Python 3.12+)      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │               Multi-Agent Orchestrator                  │   │
│   └────┬───────────┬───────────┬───────────┬───────────┬────┘   │
│        ▼           ▼           ▼           ▼           ▼        │
│    Document      Coding     Research    Desktop      Study      │
│     Agent        Agent       Agent       Agent       Agent      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Security Layer: Path Validator • Permission Levels 1-4  │   │
│   │ Tools: python-pptx • python-docx • reportlab • pytest   │   │
│   │ Persistence: SQLite (SQLAlchemy 2.0 Async + aiosqlite)  │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start on Windows

### Prerequisites
1. **Python 3.12+** (tested and fully compatible with Python 3.15)
2. **Node.js v18+** with npm

### 1. Clone or Open the Workspace
```powershell
Set-Location "C:\Users\user\.gemini\antigravity\scratch\jarvis-assistant"
```

### 2. Setup the Python Backend
```powershell
Set-Location backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate and install dependencies
.\.venv\Scripts\pip.exe install -r requirements.txt

# Return to project root
Set-Location ..
```

### 3. Setup the Desktop Frontend
```powershell
Set-Location desktop

# Install npm dependencies
npm.cmd install

# Return to project root
Set-Location ..
```

---

## ⚡ Running JARVIS

### Option A: One-Click Launch (Recommended)
Launch both the backend and desktop frontend in separate Windows consoles:
```powershell
.\scripts\start-all.ps1
```

### Option B: Manual Launch
In **Terminal 1** (Backend):
```powershell
.\scripts\start-backend.ps1
# Runs at http://127.0.0.1:8000 (API Docs at http://127.0.0.1:8000/docs)
```

In **Terminal 2** (Desktop Interface):
```powershell
.\scripts\start-desktop.ps1
# Runs at http://localhost:1420
```

Open your browser or desktop webview to **`http://localhost:1420`**.

---

## 🧪 Running Automated Tests

Run the full verification suite (Backend pytest + Frontend TypeScript build):
```powershell
.\scripts\run-tests.ps1
```

Or run backend tests individually:
```powershell
Set-Location backend
.\.venv\Scripts\pytest.exe -v
```

---

## 🔒 Security & Permission Model

JARVIS implements **Full User-Controlled Autonomy**:

| Level | Capability | Requirement |
|---|---|---|
| **Level 1 — Read & Analyze** | Read workspace files, web research, view logs | Allowed automatically |
| **Level 2 — Create** | Generate PPTX, DOCX, PDF, create folders/notes | Allowed automatically in approved directories |
| **Level 3 — Modify & Execute** | Run test suites, open Windows applications | **Requires Explicit Approval** in Approval Center |
| **Level 4 — Sensitive / External** | Delete files, modify critical security settings | **Requires Explicit Approval** in Approval Center |

### Emergency Stop
If any autonomous agent executes an undesired action, click the **EMERGENCY STOP** button in the top right header to instantly cancel all running and queued jobs.
