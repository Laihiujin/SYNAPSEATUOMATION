@echo off
chcp 65001 >nul

REM Set UTF-8 encoding environment
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

REM Fix Celery 5.5.x Windows thread-local storage bug
set FORKED_BY_MULTIPROCESSING=1

set "ROOT=%~dp0"
set "VENV_PATH=%ROOT%synenv"

REM Celery Worker 启动脚本 (Windows - synenv)
REM 用于运行发布任务队列

echo ============================================
echo   SynapseAutomation Celery Worker (synenv)
echo ============================================
echo.

REM Activate synenv virtual environment
if not exist "%VENV_PATH%\Scripts\activate.bat" (
    echo [ERROR] Virtual environment 'synenv' not found at: %VENV_PATH%
    echo Please run: python -m venv synenv
    pause
    exit /b 1
)

call "%VENV_PATH%\Scripts\activate.bat"
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment 'synenv'
    pause
    exit /b 1
)
echo OK Activated virtual environment 'synenv'
set "PY=python"
echo.

REM 检查 Redis 是否运行
echo [1/3] 检查 Redis 服务...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis 未运行，请先启动 Redis 服务
    echo    命令: redis-server
    pause
    exit /b 1
)
echo ✅ Redis 运行正常

echo.
echo [2/3] 切换到项目目录...
cd /d "%ROOT%"
cd syn_backend

echo.
echo [3/3] 启动 Celery Worker...
echo.
echo 任务队列: 发布任务（publish.single, publish.batch）
echo Broker: Redis (read from .env REDIS_URL)
echo.

REM Use threads pool to enable concurrent execution on Windows
REM 并发数设为 1000（异步高并发，上不封顶）
%PY% -m celery -A fastapi_app.tasks.celery_app worker ^
    --loglevel=info ^
    --pool=threads ^
    --concurrency=1000 ^
    --hostname=synapse-worker@%%h

pause
