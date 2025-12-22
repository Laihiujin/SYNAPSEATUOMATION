@echo off
chcp 65001 >nul

REM Set UTF-8 encoding environment
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

set "ROOT=%~dp0..\.."
set "BACKEND_DIR=%ROOT%\syn_backend"

echo ========================================
echo   Synapse Backend Startup (Windows)
echo ========================================
echo.

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



REM Kill all processes listening on port 7000 (more reliable than parsing netstat)
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }"

echo.
echo Waiting for port release...
timeout /t 3 /nobreak >nul

REM Bundle Playwright browsers inside this repo (important for packaging to exe)
set "PLAYWRIGHT_BROWSERS_PATH=%ROOT%\.playwright-browsers"
set "MANUS_API_BASE_URL=http://localhost:7000/api/v1"
REM Enable OCR/Selenium helpers (can be overridden by existing env vars)
if not defined ENABLE_OCR_RESCUE set "ENABLE_OCR_RESCUE=1"
if not defined ENABLE_SELENIUM_RESCUE set "ENABLE_SELENIUM_RESCUE=1"
if not defined ENABLE_SELENIUM_DEBUG set "ENABLE_SELENIUM_DEBUG=1"
if not defined PLAYWRIGHT_AUTO_INSTALL set "PLAYWRIGHT_AUTO_INSTALL=1"
echo [CONFIG] Playwright path: %PLAYWRIGHT_BROWSERS_PATH%
echo [CONFIG] OCR rescue: %ENABLE_OCR_RESCUE%  Selenium rescue: %ENABLE_SELENIUM_RESCUE%  Selenium debug: %ENABLE_SELENIUM_DEBUG%
echo.

pushd "%BACKEND_DIR%"

echo [1/5] Checking Python environment...
%PY% --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python cannot run
    popd
    pause
    exit /b 1
)
echo OK Python environment normal
echo.

echo [2/5] Ensuring Playwright Chromium...
%PY% -c "from utils.playwright_bootstrap import ensure_playwright_chromium_installed as f; r=f(auto_install=True); print('Chromium:', r.chromium_executable or 'N/A'); import sys; sys.exit(0 if r.installed else 1)"
if errorlevel 1 (
    echo [ERROR] Playwright Chromium not ready
    echo Suggestion: run scripts\launchers\setup_browser.bat
    echo.
) else (
    echo OK Browser environment normal
)
echo.

echo [3/5] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
        echo OK Created .env file
    )
) else (
    echo OK Environment configuration file exists
)
echo.

echo [4/5] Checking database files...
if not exist "db\database.db" (
    echo [WARNING] Main database file not found
)
if not exist "db\cookie_store.db" (
    echo [WARNING] Cookie database file not found
)
echo.

REM Magentic-UI disabled
echo [SKIP] Magentic-UI not started at this time
echo.

echo ========================================
echo   [5/5] Starting FastAPI Service (Port: 7000)
echo ========================================
echo.
echo Access URLs:
echo   - API: http://localhost:7000/api/v1
echo   - API Docs: http://localhost:7000/api/docs
echo   - ReDoc: http://localhost:7000/api/redoc
echo   - Health Check: http://localhost:7000/health
echo.
echo Press Ctrl+C to stop service
echo ========================================
echo.

%PY% fastapi_app/run.py
set "RC=%ERRORLEVEL%"
popd

if not "%RC%"=="0" (
    echo.
    echo [ERROR] Service startup failed
    pause
    exit /b 1
)

pause
~