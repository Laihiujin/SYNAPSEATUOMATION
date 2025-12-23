@echo off
chcp 65001 >nul

REM Set UTF-8 encoding environment
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
REM Celery Worker 启动脚本 (Windows)
REM 用于运行发布任务队列

echo ============================================
echo   SynapseAutomation Celery Worker
echo ============================================
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
cd /d "%~dp0"
cd syn_backend

echo.
echo [3/3] 启动 Celery Worker...
echo.
echo 任务队列: 发布任务（publish.single, publish.batch）
echo Broker: Redis (read from .env REDIS_URL)
echo.

REM 使用 --pool=solo 避免 Windows 多进程问题
python -m celery -A fastapi_app.tasks.celery_app worker ^
    --loglevel=info ^
    --pool=solo ^
    --concurrency=3 ^
    --hostname=synapse-worker@%%h

pause
