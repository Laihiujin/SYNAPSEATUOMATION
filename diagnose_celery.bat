@echo off
chcp 65001 >nul

REM Diagnostic script for Celery Worker startup issues
echo ============================================
echo   Celery Worker Diagnostic Tool
echo ============================================
echo.

echo [1/5] Checking conda environment...
call conda activate syn
if errorlevel 1 (
    echo [ERROR] Failed to activate conda environment 'syn'
    echo Please run: conda create -n syn python=3.11
    pause
    exit /b 1
)
echo OK Conda environment activated
echo.

echo [2/5] Checking Python...
python --version
if errorlevel 1 (
    echo [ERROR] Python not found
    pause
    exit /b 1
)
echo OK Python found
echo.

echo [3/5] Checking Celery installation...
python -c "import celery; print('Celery version:', celery.__version__)"
if errorlevel 1 (
    echo [ERROR] Celery not installed
    echo Please run: pip install celery
    pause
    exit /b 1
)
echo OK Celery installed
echo.

echo [4/5] Checking Redis connectivity...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Redis not running
    echo Please start Redis first: redis-server
    pause
    exit /b 1
)
echo OK Redis running
echo.

echo [5/5] Checking project structure...
cd /d "%~dp0"
if not exist "syn_backend" (
    echo [ERROR] syn_backend directory not found
    echo Current directory: %cd%
    pause
    exit /b 1
)
cd syn_backend
if not exist "fastapi_app" (
    echo [ERROR] fastapi_app directory not found
    echo Current directory: %cd%
    pause
    exit /b 1
)
echo OK Project structure valid
echo Current directory: %cd%
echo.

echo ============================================
echo   All checks passed!
echo   Attempting to start Celery Worker...
echo ============================================
echo.

REM Start Celery Worker
python -m celery -A fastapi_app.tasks.celery_app worker --loglevel=info --pool=solo --concurrency=1000 --hostname=synapse-worker@%%h

pause
