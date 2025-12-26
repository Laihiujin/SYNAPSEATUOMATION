@echo off
REM 设置 Playwright 浏览器下载路径
set PLAYWRIGHT_BROWSERS_PATH=E:\SynapseAutomation\browsers\playwright-browsers

REM 下载 Firefox
cd syn_backend
python -m playwright install firefox

echo.
echo ✅ Firefox 已下载到 %PLAYWRIGHT_BROWSERS_PATH%
pause
