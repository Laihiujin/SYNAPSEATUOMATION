@echo off
chcp 65001 >nul
set PYTHONUTF8=1

:: ========================================
:: SynapseAutomation 安装包构建脚本（管理员模式）
:: ========================================

echo ========================================
echo SynapseAutomation 安装包构建工具
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

:: Enable Developer Mode
echo [1/8] 启用开发者模式...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense /t REG_DWORD /d 1 /f >nul 2>&1
echo   完成（重启后生效，但可继续构建）
echo.

:: 进入 desktop 目录
cd /d "%~dp0"
if not exist "package.json" (
    echo [错误] 未找到 package.json
    pause
    exit /b 1
)

:: Clean Caches
echo [2/8] 清理所有缓存...
if exist "dist" (
    echo   - 删除 dist 目录...
    rmdir /s /q dist 2>nul
)

if exist "%LOCALAPPDATA%\electron-builder\Cache" (
    echo   - 清理整个 electron-builder 缓存...
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache" 2>nul
)

if exist "node_modules\.cache" (
    echo   - 清理 node_modules 缓存...
    rmdir /s /q "node_modules\.cache" 2>nul
)
echo   完成
echo.

:: 检查 Node.js 依赖
echo [3/8] 检查 Node.js 依赖...
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

:: 准备资源文件
echo [4/8] 准备资源文件...
call npm run prepare:resources
if %errorLevel% neq 0 (
    echo [错误] 资源准备失败
    pause
    exit /b 1
)
echo.

:: 测试符号链接权限
echo [5/8] 测试符号链接权限...
mklink test_symlink.txt package.json >nul 2>&1
if %errorLevel% equ 0 (
    echo   ✓ 符号链接测试通过
    del test_symlink.txt >nul 2>&1
) else (
    echo   ✗ 符号链接创建失败
    echo.
    echo   可能需要：
    echo   1. 重启 Windows 使开发者模式生效
    echo   2. 或手动启用组策略（见 TROUBLESHOOTING.md）
    echo.
    echo   是否继续尝试构建？(Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)
echo.

:: Set Environment Variables
echo [6/8] 配置构建环境...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set CSC_LINK=
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
echo   - 已禁用代码签名
echo   - 已设置 ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES
echo.

:: Build Package
echo [7/8] 构建 NSIS 安装包...
echo   这可能需要 10-20 分钟，请耐心等待...
echo.

call npx electron-builder --win --x64
if %errorLevel% neq 0 (
    echo.
    echo [错误] 构建失败
    echo.
    echo 常见问题解决：
    echo 1. 确保以管理员身份运行
    echo 2. 检查磁盘空间（需要至少 5GB）
    echo 3. 关闭杀毒软件（可能拦截文件操作）
    echo 4. 查看完整日志：npm run build
    echo.
    pause
    exit /b 1
)

:: 验证构建结果
echo.
echo [8/8] 验证构建结果...
if exist "dist\SynapseAutomation-Setup-*.exe" (
    echo.
    echo ========================================
    echo 构建成功！
    echo ========================================
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
