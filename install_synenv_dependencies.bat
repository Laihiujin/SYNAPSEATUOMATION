@echo off
chcp 65001 >nul
echo ============================================
echo   SynapseAutomation - 安装依赖 (synenv)
echo ============================================
echo.

set "VENV_PATH=%~dp0synenv"

REM 检查虚拟环境是否存在
if not exist "%VENV_PATH%\Scripts\activate.bat" (
    echo ❌ 虚拟环境 'synenv' 不存在
    echo.
    echo 正在创建虚拟环境...
    python -m venv synenv
    if errorlevel 1 (
        echo [ERROR] 创建虚拟环境失败
        pause
        exit /b 1
    )
    echo ✅ 虚拟环境创建成功
)

echo.
echo 激活虚拟环境...
call "%VENV_PATH%\Scripts\activate.bat"
if errorlevel 1 (
    echo [ERROR] 激活虚拟环境失败
    pause
    exit /b 1
)
echo ✅ 虚拟环境已激活

echo.
echo ============================================
echo   [1/2] 升级 pip
echo ============================================
python -m pip install --upgrade pip
if errorlevel 1 (
    echo [WARNING] pip 升级失败，继续安装依赖...
)

echo.
echo ============================================
echo   [2/2] 安装项目依赖
echo ============================================
echo 这可能需要 10-30 分钟，请耐心等待...
echo.
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 项目依赖安装完成

echo.
echo ============================================
echo   ✅ 所有依赖安装完成
echo ============================================
echo.
echo 检测到已有浏览器:
echo   - E:\SynapseAutomation\.chrome-for-testing
echo   - E:\SynapseAutomation\.playwright-browsers
echo 无需重新安装浏览器
echo ============================================
echo.
echo 下一步:
echo   1. 启动所有服务: start_all_services_synenv.bat
echo   2. 或单独启动服务:
echo      - Celery Worker: start_celery_worker_synenv.bat
echo      - Playwright Worker: scripts\launchers\start_worker_synenv.bat
echo      - Backend: scripts\launchers\start_backend_synenv.bat
echo.
pause
