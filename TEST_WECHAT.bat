@echo off
chcp 65001
cls
echo ====================================================================
echo   视频号数据采集功能测试
echo ====================================================================
echo.

cd /d E:\SynapseAutomation

echo [1/4] 检查 Python 环境...
E:\SynapseAutomation\synenv\Scripts\python.exe --version
if errorlevel 1 (
    echo ERROR: Python 环境不可用
    pause
    exit /b 1
)
echo OK
echo.

echo [2/4] 检查依赖...
E:\SynapseAutomation\synenv\Scripts\python.exe -c "import selenium; print('✓ selenium')"
if errorlevel 1 (
    echo 正在安装 selenium...
    E:\SynapseAutomation\synenv\Scripts\pip.exe install selenium
)

E:\SynapseAutomation\synenv\Scripts\python.exe -c "import bs4; print('✓ beautifulsoup4')"
if errorlevel 1 (
    echo 正在安装 beautifulsoup4...
    E:\SynapseAutomation\synenv\Scripts\pip.exe install beautifulsoup4
)
echo OK
echo.

echo [3/4] 检查 Cookie 文件...
dir syn_backend\cookiesFile\channels_*.json
if errorlevel 1 (
    echo ERROR: 未找到 Cookie 文件
    pause
    exit /b 1
)
echo OK
echo.

echo [4/4] 开始测试...
echo.
E:\SynapseAutomation\synenv\Scripts\python.exe syn_backend\crawlers\wechat_channels\test_simple.py

echo.
echo ====================================================================
echo   测试完成！
echo ====================================================================
echo.
pause
