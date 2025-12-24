@echo off
REM ========================================
REM 准备服务器部署包（清理缓存）
REM ========================================

echo [1/6] 清理前端缓存...
if exist syn_frontend_react\node_modules rmdir /s /q syn_frontend_react\node_modules
if exist syn_frontend_react\.next rmdir /s /q syn_frontend_react\.next
if exist syn_frontend_react\out rmdir /s /q syn_frontend_react\out

echo [2/6] 清理 Desktop 构建产物...
if exist desktop\node_modules rmdir /s /q desktop\node_modules
if exist desktop\dist rmdir /s /q desktop\dist
if exist desktop\resources rmdir /s /q desktop\resources

echo [3/6] 清理浏览器二进制...
if exist .playwright-browsers rmdir /s /q .playwright-browsers
if exist .chrome-for-testing rmdir /s /q .chrome-for-testing

echo [4/6] 清理 Python 缓存...
for /d /r %%i in (__pycache__) do @if exist "%%i" rmdir /s /q "%%i"
for /d /r %%i in (.pytest_cache) do @if exist "%%i" rmdir /s /q "%%i"

echo [5/6] 清理日志和临时文件...
if exist syn_backend\logs rmdir /s /q syn_backend\logs
if exist logs rmdir /s /q logs
del /q /s *.log 2>nul
del /q dump.rdb 2>nul

echo [6/6] 清理 IDE 配置...
if exist .vscode rmdir /s /q .vscode
if exist .idea rmdir /s /q .idea
if exist .claude rmdir /s /q .claude

echo.
echo ========================================
echo ✅ 清理完成！现在可以打包部署
echo ========================================
echo.
echo 清理后的项目大小约 50-100 MB（不含虚拟环境）
echo.
echo 打包命令示例：
echo   7z a -mx=9 SynapseAutomation-deploy.7z E:\SynapseAutomation -xr!syn-env
echo   或
echo   tar -czf SynapseAutomation-deploy.tar.gz --exclude=syn-env E:\SynapseAutomation
echo.
pause
