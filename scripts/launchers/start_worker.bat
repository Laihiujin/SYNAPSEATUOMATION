@echo off
chcp 65001 >nul
echo ========================================
echo   Playwright Worker Startup
echo ========================================
echo.

set "ROOT=%~dp0..\.."
set "BACKEND_DIR=%ROOT%\syn_backend"

REM Activate conda environment (syn)
call conda activate syn
if errorlevel 1 (
    echo [ERROR] Failed to activate conda environment 'syn'
    echo Please run: conda create -n syn python=3.11
    pause
    exit /b 1
)
echo OK Activated conda environment 'syn'
set "PY=python"
echo.

REM Bundle Playwright browsers inside this repo (important for packaging to exe)
set "PLAYWRIGHT_BROWSERS_PATH=%ROOT%\.playwright-browsers"
REM Enable OCR/Selenium helpers (can be overridden by existing env vars)
if not defined ENABLE_OCR_RESCUE set "ENABLE_OCR_RESCUE=1"
if not defined ENABLE_SELENIUM_RESCUE set "ENABLE_SELENIUM_RESCUE=1"
if not defined ENABLE_SELENIUM_DEBUG set "ENABLE_SELENIUM_DEBUG=1"
if not defined PLAYWRIGHT_AUTO_INSTALL set "PLAYWRIGHT_AUTO_INSTALL=1"

REM Kill existing Worker (more reliable than parsing netstat)
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 7001 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }"
timeout /t 2 /nobreak >nul

pushd "%BACKEND_DIR%"

echo Starting Playwright Worker...
echo   - Port: 7001
echo   - Health: http://localhost:7001/health
echo.

%PY% playwright_worker\worker.py
popd

pause
