@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   重启所有服务
echo ========================================
echo.

set ROOT=%~dp0

REM 1. 停止所有服务
echo [1/3] 正在停止所有服务...
echo.

REM 停止 Backend (FastAPI)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7000 ^| findstr LISTENING') do (
    echo 停止 Backend FastAPI ^(PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止 Worker
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7001 ^| findstr LISTENING') do (
    echo 停止 Playwright Worker ^(PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止 Celery
for /f "tokens=2" %%a in ('tasklist ^| findstr /i celery') do (
    echo 停止 Celery ^(PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止 Frontend
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 停止 Frontend ^(PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo 等待进程完全退出...
timeout /t 3 /nobreak >nul
echo.

REM 2. 启动所有服务
echo [2/3] 正在启动所有服务...
echo.

REM 激活 conda 环境
call conda activate syn
if errorlevel 1 (
    echo [ERROR] 无法激活 conda 环境 syn
    pause
    exit /b 1
)

REM 启动 Worker
echo 启动 Playwright Worker...
cd /d "%ROOT%\syn_backend"
start "Playwright Worker" cmd /k "conda activate syn && python playwright_worker\worker.py"
timeout /t 2 /nobreak >nul

REM 启动 Backend
echo 启动 Backend FastAPI...
cd /d "%ROOT%\syn_backend"
start "Backend FastAPI" cmd /k "conda activate syn && python -m uvicorn fastapi_app.main:app --host 0.0.0.0 --port 7000 --reload"
timeout /t 3 /nobreak >nul

REM 启动 Celery
echo 启动 Celery Worker...
cd /d "%ROOT%\syn_backend"
start "Celery Worker" cmd /k "conda activate syn && celery -A celery_app.celery_app worker --loglevel=info --pool=solo"
timeout /t 2 /nobreak >nul

echo.
echo [3/3] 等待服务启动完成...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo   服务重启完成！
echo ========================================
echo.
echo 服务状态:
echo   - Playwright Worker: http://127.0.0.1:7001/health
echo   - Backend FastAPI:   http://127.0.0.1:7000/docs
echo   - Celery Worker:     运行中
echo.
echo 请等待 5-10 秒后刷新前端页面测试
echo.

cd /d "%ROOT%"
pause
