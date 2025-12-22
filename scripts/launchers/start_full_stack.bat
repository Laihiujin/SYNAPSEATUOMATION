@echo off
chcp 65001 >nul
echo ========================================
echo   Synapse Backend Full Stack Startup
echo   API Server + Playwright Worker
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

REM Kill existing processes
echo [1/4] Stopping existing services...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }"
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 7001 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }"
echo.

echo [2/4] Waiting for ports to release...
timeout /t 2 /nobreak >nul
echo.

REM Start Playwright Worker first
echo [3/4] Starting Playwright Worker (Port 7001)...
start "Playwright Worker" cmd /c "\"%PY%\" \"%BACKEND_DIR%\\playwright_worker\\worker.py\""
echo   - Worker started in background
echo   - URL: http://localhost:7001/health
echo.

echo Waiting for Worker to initialize...
timeout /t 3 /nobreak >nul
echo.

REM Start API Server
echo [4/4] Starting FastAPI Server (Port 7000)...
start "FastAPI Server" cmd /c "\"%~dp0start_backend.bat\""
echo   - API Server started
echo   - URL: http://localhost:7000/api/docs
echo.

echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo   Playwright Worker: http://localhost:7001
echo   FastAPI API:       http://localhost:7000
echo   API Docs:          http://localhost:7000/api/docs
echo.
echo Press any key to view service status...
pause >nul

REM Show running processes
echo.
echo Current Python processes:
tasklist | findstr python.exe
echo.
echo Ports in use:
netstat -ano | findstr ":7000"
netstat -ano | findstr ":7001"
echo.

echo ========================================
echo To stop all services, press Ctrl+C
echo ========================================
pause
