@echo off
chcp 65001 >nul
set PYTHONUTF8=1

:: ========================================
:: SynapseAutomation Inno Setup 构建脚本
:: ========================================

echo ========================================
echo SynapseAutomation Inno Setup 安装包构建
echo ========================================
echo.

:: 强制检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 必须以管理员身份运行！
    echo.
    echo 请右键点击此文件，选择 "以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo [✓] 管理员权限确认
echo.

:: 进入 desktop 目录
cd /d "%~dp0"
if not exist "package.json" (
    echo [错误] 未找到 package.json
    pause
    exit /b 1
)

:: ========================================
:: 步骤 1: 检查 Inno Setup
:: ========================================
echo [1/7] 检查 Inno Setup...

:: 尝试在 PATH 中查找
set "ISCC_PATH="
where iscc >nul 2>&1
if %errorLevel% equ 0 (
    set "ISCC_PATH=iscc"
) else (
    :: 检查默认安装路径
    if exist "C:\Program Files (x86)\Inno Setup 6\iscc.exe" (
        set "ISCC_PATH=C:\Program Files (x86)\Inno Setup 6\iscc.exe"
    ) else if exist "C:\Program Files\Inno Setup 6\iscc.exe" (
        set "ISCC_PATH=C:\Program Files\Inno Setup 6\iscc.exe"
    ) else (
        echo [错误] 未找到 Inno Setup 编译器 (iscc.exe)
        echo.
        echo 请安装 Inno Setup 6:
        echo   下载地址: https://jrsoftware.org/isdl.php
        echo   或使用 Chocolatey: choco install innosetup
        echo.
        pause
        exit /b 1
    )
)
echo   ✓ Inno Setup 已安装: %ISCC_PATH%
echo.

:: ========================================
:: 步骤 2: 清理缓存
:: ========================================
echo [2/7] 清理所有缓存...
if exist "dist" (
    echo   - 删除 dist 目录...
    rmdir /s /q dist 2>nul
)

if exist "%LOCALAPPDATA%\electron-builder\Cache" (
    echo   - 清理 electron-builder 缓存...
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache" 2>nul
)

if exist "node_modules\.cache" (
    echo   - 清理 node_modules 缓存...
    rmdir /s /q "node_modules\.cache" 2>nul
)
echo   完成
echo.

:: ========================================
:: 步骤 3: 检查 Node.js 依赖
:: ========================================
echo [3/7] 检查 Node.js 依赖...
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

:: ========================================
:: 步骤 4: 准备浏览器 ZIP 文件
:: ========================================
echo [4/7] 准备浏览器 ZIP 文件...
call prepare-browsers-zip.bat
if %errorLevel% neq 0 (
    echo [警告] 浏览器 ZIP 准备失败，将继续构建（首次启动时需手动下载浏览器）
    echo.
    choice /C YN /M "是否继续构建（不含预装浏览器）？"
    if errorlevel 2 exit /b 1
)
echo.

:: ========================================
:: 步骤 5: 准备资源文件
:: ========================================
echo [5/7] 准备资源文件...
call npm run prepare:resources
if %errorLevel% neq 0 (
    echo [错误] 资源准备失败
    pause
    exit /b 1
)
echo.

:: ========================================
:: 步骤 6: 构建 Electron 应用（--dir 模式）
:: ========================================
echo [6/7] 构建 Electron 应用...
echo   这可能需要 5-10 分钟，请耐心等待...
echo.

set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set CSC_LINK=
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

call npx electron-builder --win --dir
if %errorLevel% neq 0 (
    echo.
    echo [错误] Electron 构建失败
    echo.
    pause
    exit /b 1
)

:: 验证构建结果
if not exist "dist\win-unpacked\SynapseAutomation.exe" (
    echo [错误] 未找到构建的 Electron 应用
    echo.
    pause
    exit /b 1
)

echo   ✓ Electron 应用构建完成
echo.

:: ========================================
:: 步骤 7: 使用 Inno Setup 编译安装程序
:: ========================================
echo [7/7] 使用 Inno Setup 编译安装程序...
echo   这可能需要 5-10 分钟（压缩大文件）...
echo.

"%ISCC_PATH%" installer.iss
if %errorLevel% neq 0 (
    echo.
    echo [错误] Inno Setup 编译失败
    echo.
    pause
    exit /b 1
)

:: ========================================
:: 验证最终结果
:: ========================================
echo.
echo ========================================
echo 验证构建结果...
echo ========================================
echo.

if exist "dist\SynapseAutomation-Setup-*.exe" (
    echo ✅ 构建成功！
    echo.

    for %%f in (dist\SynapseAutomation-Setup-*.exe) do (
        echo 文件名: %%~nxf
        set size=%%~zf
        set /a sizeMB=%%~zf/1048576
        echo 文件大小: !sizeMB! MB
    )

    echo.
    echo 安装包位置: dist\
    echo.
    echo 按任意键打开 dist 目录...
    pause >nul
    explorer "dist"
) else (
    echo.
    echo [警告] 未找到安装包文件
    echo.
    echo 检查 dist 目录内容:
    dir dist /b
    echo.
    pause
)
