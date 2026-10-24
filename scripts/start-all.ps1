$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting JARVIS: Complete Windows AI Assistant   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$BackendScript = Join-Path $ScriptDir "start-backend.ps1"
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$BackendScript`""

Start-Sleep -Seconds 2

$DesktopScript = Join-Path $ScriptDir "start-desktop.ps1"
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$DesktopScript`""

Start-Sleep -Seconds 3

Start-Process "http://localhost:1420"

Write-Host "`nJARVIS is launching!" -ForegroundColor Green
Write-Host "• Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "• Desktop:  http://localhost:1420" -ForegroundColor White
