$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DesktopDir = Join-Path $ProjectRoot "desktop"

Set-Location $DesktopDir
Write-Host "========================================" -ForegroundColor Blue
Write-Host " Launching JARVIS Desktop Interface" -ForegroundColor Blue
Write-Host " UI: http://localhost:1420" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Blue

& npm.cmd run dev
