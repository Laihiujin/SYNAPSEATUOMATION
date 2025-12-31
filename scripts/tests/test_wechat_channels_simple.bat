@echo off
chcp 65001 >nul
echo ========================================
echo   视频号数据采集功能测试
echo ========================================
echo.

set ROOT=%~dp0..\..\..
cd /d %ROOT%

echo 🔍 检查 conda 环境...
call conda activate syn
if errorlevel 1 (
    echo [ERROR] 无法激活 conda 环境 syn
    echo 请先运行: conda create -n syn python=3.11
    pause
    exit /b 1
)

echo ✅ 环境已激活
echo.

echo 📋 检查依赖...
pip show selenium >nul 2>&1
if errorlevel 1 (
    echo ⚠️  缺少 selenium，正在安装...
    pip install selenium
)

pip show beautifulsoup4 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  缺少 beautifulsoup4，正在安装...
    pip install beautifulsoup4
)

echo ✅ 依赖检查完成
echo.

echo 🚀 开始运行测试...
echo.

python syn_backend/crawlers/wechat_channels/test_simple.py

echo.
echo ========================================
echo   测试完成！
echo ========================================
pause
