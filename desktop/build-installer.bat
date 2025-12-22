@echo off
chcp 65001 >nul

REM Set UTF-8 encoding environment
set PYTHONUTF8=1
:: SynapseAutomation Windows 安装包构建脚本
:: 需要以管理员身份运行

echo ========================================
echo SynapseAutomation 安装包构建工具
echo ========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 此脚本需要管理员权限运行！
    echo.
    echo 请右键点击此文件，选择 "以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo [1/6] 检查管理员权限... 通过
echo.

echo [2/6] 启用开发者模式...
echo 正在启用 Windows 开发者模式以支持符号链接...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense /t REG_DWORD /d 1 /f >nul 2>&1
echo 完成（需重启生效，但构建可继续）
echo.

:: 进入 desktop 目录
cd /d "%~dp0"
if not exist "package.json" (
    echo [错误] 未找到 package.json，请确保在 desktop 目录运行此脚本
    pause
    exit /b 1
)

echo [3/6] 清理构建缓存...
if exist "dist" (
    echo   - 删除 dist 目录...
    rmdir /s /q dist
)

if exist "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    echo   - 清理 electron-builder 签名缓存...
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign"
)

if exist "%LOCALAPPDATA%\electron-builder\Cache\nsis" (
    echo   - 清理 NSIS 缓存...
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\nsis"
)
echo   完成
echo.

echo [4/6] 检查 Node.js 依赖...
if not exist "node_modules" (
    echo   - 安装依赖包...
    call npm install
    if %errorLevel% neq 0 (
        echo [错误] npm install 失败
        pause
        exit /b 1
    )
) else (
    echo   - 依赖已安装
)
echo.

echo [5/6] 准备资源文件...
call npm run prepare:resources
if %errorLevel% neq 0 (
    echo [错误] 资源准备失败
    pause
    exit /b 1
)
echo.

echo [6/6] 构建安装包...
echo   这可能需要几分钟，请耐心等待...
echo.

:: 设置环境变量禁用签名
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=

call npx electron-builder --win --x64
if %errorLevel% neq 0 (
    echo.
    echo [错误] 构建失败，请查看上方错误信息
    echo.
    echo 常见问题解决：
    echo 1. 确保以管理员身份运行
    echo 2. 如仍有符号链接错误，需启用 Windows 开发者模式:
    echo    设置 ^>^ 更新和安全 ^>^ 开发者选项 ^>^ 开启开发者模式
    echo 3. 或手动删除缓存: rmdir /s /q %%LOCALAPPDATA%%\electron-builder\Cache
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建成功！
echo ========================================
echo.
echo 安装包位置: dist\SynapseAutomation-Setup-0.1.0.exe
echo.

:: 检查文件是否存在并显示大小
if exist "dist\SynapseAutomation-Setup-*.exe" (
    for %%f in (dist\SynapseAutomation-Setup-*.exe) do (
        echo 文件名: %%~nxf
        set /a sizeMB=%%~zf/1048576
        echo 文件大小: %%~zf 字节 (约 !sizeMB! MB)
    )
    echo.
    echo 按任意键打开 dist 目录...
    pause >nul
    explorer "dist"
) else (
    echo [警告] 未找到安装包文件
    pause
)
