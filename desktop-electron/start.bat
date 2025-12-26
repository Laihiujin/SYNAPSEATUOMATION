@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   SynapseAutomation Desktop 快速启动
echo ========================================
echo.

cd /d "%~dp0"

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [1/3] 📦 安装依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

REM 检查是否已准备浏览器
if not exist "resources\browsers\browser-info.json" (
    echo [2/3] 🌐 准备 Playwright 浏览器...
    echo 这可能需要几分钟，请耐心等待...
    echo.
    call npm run prepare-browsers
    if errorlevel 1 (
        echo.
        echo ❌ 浏览器准备失败！
        pause
        exit /b 1
    )
    echo ✅ 浏览器准备完成
    echo.
) else (
    echo [2/3] ✅ 浏览器已就绪，跳过准备
    echo.
)

REM 启动应用
echo [3/3] 🚀 启动 Electron 应用...
echo.
call npm run dev

pause
