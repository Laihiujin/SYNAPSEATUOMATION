@echo off
chcp 65001 >nul
REM 浏览器打包脚本 - 仅打包 Chrome for Testing

echo ============================================
echo   准备浏览器 ZIP 文件 (Chrome for Testing)
echo ============================================
echo.

set "PROJECT_ROOT=%~dp0.."
set "RESOURCES_DIR=%PROJECT_ROOT%\desktop\resources"
set "BROWSERS_ZIP_DIR=%RESOURCES_DIR%\browsers-zip"

REM 创建 browsers-zip 目录
if not exist "%BROWSERS_ZIP_DIR%" mkdir "%BROWSERS_ZIP_DIR%"

echo [1/2] 检查 Chrome for Testing 源文件...

REM Chrome for Testing
set "CHROME_TESTING=%PROJECT_ROOT%\.chrome-for-testing"
set "CHROME_DIR=%CHROME_TESTING%\chrome-*\chrome-win64"

REM 查找 Chrome for Testing 目录
for /d %%d in ("%CHROME_TESTING%\chrome-*") do (
    set "FOUND_CHROME=%%d\chrome-win64"
    goto :found_chrome
)
:found_chrome

echo.
echo [2/2] 压缩 Chrome for Testing...
echo.

REM 压缩 Chrome for Testing（如果存在）
if exist "%FOUND_CHROME%" (
    echo [chrome] 正在压缩 Chrome for Testing...
    powershell -NoProfile -Command "Compress-Archive -Path '%FOUND_CHROME%' -DestinationPath '%BROWSERS_ZIP_DIR%\chrome-for-testing.zip' -Force"
    if errorlevel 1 (
        echo [error] Chrome for Testing 压缩失败
        pause
        exit /b 1
    ) else (
        echo [ok] Chrome for Testing 压缩完成: browsers-zip\chrome-for-testing.zip
    )
) else (
    echo [error] 未找到 Chrome for Testing！
    echo.
    echo 请先下载 Chrome for Testing：
    echo   python .chrome-for-testing\download_chrome_for_testing.py
    pause
    exit /b 1
)

echo.
echo ============================================
echo   ✅ Chrome for Testing ZIP 文件准备完成
echo ============================================
echo.
echo 文件位置: %BROWSERS_ZIP_DIR%
echo.
echo 下一步：以管理员身份运行 build-innosetup.bat 打包应用
echo.
pause
