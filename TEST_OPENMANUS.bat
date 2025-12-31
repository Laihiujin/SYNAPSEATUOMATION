@echo off
chcp 65001 >nul
echo ========================================
echo   Testing OpenManus Integration
echo ========================================
echo.

cd /d E:\SynapseAutomation

echo [1/3] Testing Python imports...
synenv\Scripts\python.exe -c "import sys; from pathlib import Path; sys.path.insert(0, str(Path('syn_backend'))); sys.path.insert(0, str(Path('syn_backend/OpenManus-worker'))); from fastapi_app.agent.manus_agent import ManusAgentWrapper; from app.agent.manus import Manus; from app.schema import AgentState, Memory, Message; print('All imports OK')" 2>nul
if errorlevel 1 (
    echo [ERROR] Import test failed
    exit /b 1
)
echo [OK] All imports successful

echo.
echo [2/3] Testing FastAPI app startup...
timeout /t 2 /nobreak >nul
synenv\Scripts\python.exe -c "import sys; from pathlib import Path; sys.path.insert(0, str(Path('syn_backend'))); from fastapi_app.main import app; print('FastAPI app loaded')" 2>nul
if errorlevel 1 (
    echo [ERROR] FastAPI app load failed
    exit /b 1
)
echo [OK] FastAPI app loads successfully

echo.
echo [3/3] Starting backend server (5 seconds test)...
cd syn_backend
start /b ..\synenv\Scripts\python.exe -m uvicorn fastapi_app.main:app --host 127.0.0.1 --port 8000 --reload >nul 2>&1
timeout /t 5 /nobreak >nul

echo.
echo Testing API endpoint...
curl -s http://127.0.0.1:8000/api/health | findstr /i "ok\|healthy" >nul
if errorlevel 1 (
    echo [WARNING] Health check failed or server not ready
) else (
    echo [OK] Server is responding
)

echo.
echo Stopping test server...
taskkill /f /im python.exe >nul 2>&1

echo.
echo ========================================
echo   OpenManus Integration Test Complete
echo ========================================
pause
