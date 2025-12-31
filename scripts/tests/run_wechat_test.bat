@echo off
chcp 65001 >nul
echo ========================================
echo   视频号数据采集功能测试
echo ========================================
echo.

set ROOT=%~dp0..\..\..
cd /d %ROOT%

set PYTHON=%ROOT%\synenv\Scripts\python.exe

echo 🔍 检查 Python 环境...
if not exist "%PYTHON%" (
    echo [ERROR] synenv 环境不存在
    echo 路径: %PYTHON%
    pause
    exit /b 1
)

echo ✅ 环境检查完成: %PYTHON%
echo.

echo 📋 检查依赖...
"%PYTHON%" -c "import selenium" 2>nul
if errorlevel 1 (
    echo ⚠️  缺少 selenium，正在安装...
    "%PYTHON%" -m pip install selenium
)

"%PYTHON%" -c "import bs4" 2>nul
if errorlevel 1 (
    echo ⚠️  缺少 beautifulsoup4，正在安装...
    "%PYTHON%" -m pip install beautifulsoup4
)

echo ✅ 依赖检查完成
echo.

echo 🚀 开始运行测试...
echo.

"%PYTHON%" syn_backend/crawlers/wechat_channels/test_simple.py

echo.
echo ========================================
echo   测试完成！
echo ========================================
pause
