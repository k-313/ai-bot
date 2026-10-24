$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend"

Set-Location $BackendDir
Write-Host "Running Backend Pytest Suite..." -ForegroundColor Cyan
& ".\.venv\Scripts\pytest.exe" -v

$DesktopDir = Join-Path $ProjectRoot "desktop"
Set-Location $DesktopDir
Write-Host "`nRunning Desktop Typecheck & Build..." -ForegroundColor Blue
& npm.cmd run build
