@echo off
chcp 65001 >nul
REM 浏览器打包脚本 - 将 Chromium 和 Chrome for Testing 压缩为 zip

echo ============================================
echo   准备浏览器 ZIP 文件
echo ============================================
echo.

set "PROJECT_ROOT=%~dp0.."
set "RESOURCES_DIR=%PROJECT_ROOT%\desktop\resources"
set "BROWSERS_ZIP_DIR=%RESOURCES_DIR%\browsers-zip"

REM 创建 browsers-zip 目录
if not exist "%BROWSERS_ZIP_DIR%" mkdir "%BROWSERS_ZIP_DIR%"

echo [1/3] 检查浏览器源文件...

REM Playwright Chromium
set "PLAYWRIGHT_BROWSERS=%PROJECT_ROOT%\.playwright-browsers"
set "CHROMIUM_DIR=%PLAYWRIGHT_BROWSERS%\chromium-*"

REM Chrome for Testing
set "CHROME_TESTING=%PROJECT_ROOT%\.chrome-for-testing"
set "CHROME_DIR=%CHROME_TESTING%\chrome-*\chrome-win64"

REM 查找 Chromium 目录
for /d %%d in ("%PLAYWRIGHT_BROWSERS%\chromium-*") do (
    set "FOUND_CHROMIUM=%%d"
    goto :found_chromium
)
:found_chromium

REM 查找 Chrome for Testing 目录
for /d %%d in ("%CHROME_TESTING%\chrome-*") do (
    set "FOUND_CHROME=%%d\chrome-win64"
    goto :found_chrome
)
:found_chrome

echo.
echo [2/3] 压缩浏览器文件...
echo.

REM 压缩 Chromium（如果存在）
if exist "%FOUND_CHROMIUM%" (
    echo [chromium] 正在压缩 Playwright Chromium...
    powershell -NoProfile -Command "Compress-Archive -Path '%FOUND_CHROMIUM%' -DestinationPath '%BROWSERS_ZIP_DIR%\chromium.zip' -Force"
    if errorlevel 1 (
        echo [error] Chromium 压缩失败
    ) else (
        echo [ok] Chromium 压缩完成: browsers-zip\chromium.zip
    )
) else (
    echo [skip] 未找到 Playwright Chromium，跳过
)

REM 压缩 Chrome for Testing（如果存在）
if exist "%FOUND_CHROME%" (
    echo [chrome] 正在压缩 Chrome for Testing...
    powershell -NoProfile -Command "Compress-Archive -Path '%FOUND_CHROME%' -DestinationPath '%BROWSERS_ZIP_DIR%\chrome-for-testing.zip' -Force"
    if errorlevel 1 (
        echo [error] Chrome for Testing 压缩失败
    ) else (
        echo [ok] Chrome for Testing 压缩完成: browsers-zip\chrome-for-testing.zip
    )
) else (
    echo [skip] 未找到 Chrome for Testing，跳过
)

echo.
echo [3/3] 检查生成的 ZIP 文件...
dir "%BROWSERS_ZIP_DIR%\*.zip" /b 2>nul
if errorlevel 1 (
    echo [warn] 未找到任何 ZIP 文件！
    echo.
    echo 请先安装浏览器：
    echo   - Playwright: playwright install chromium
    echo   - Chrome for Testing: 运行相应的下载脚本
    pause
    exit /b 1
)

echo.
echo ============================================
echo   ✅ 浏览器 ZIP 文件准备完成
echo ============================================
echo.
echo 文件位置: %BROWSERS_ZIP_DIR%
echo.
echo 下一步：运行 build-installer-ADMIN.bat 打包应用
echo.
pause
