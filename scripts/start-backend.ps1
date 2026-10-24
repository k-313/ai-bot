$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend"

Set-Location $BackendDir
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Launching JARVIS Core FastAPI Backend" -ForegroundColor Cyan
Write-Host " Host: http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host " API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

& ".\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
