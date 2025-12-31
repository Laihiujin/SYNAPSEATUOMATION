@echo off
chcp 65001 >nul
echo ========================================
echo   测试账号登录状态监控功能
echo ========================================
echo.

set ROOT=%~dp0
set BACKEND_DIR=%ROOT%syn_backend

call conda activate syn
if errorlevel 1 (
    echo [ERROR] Failed to activate conda environment syn
    pause
    exit /b 1
)
echo [OK] Activated conda environment syn
echo.

cd /d %BACKEND_DIR%

echo [INFO] 开始测试登录状态检查器...
echo [INFO] 将检查所有有效账号的登录状态 (排除B站账号)
echo.

python -c "from myUtils.login_status_checker import login_status_checker; import json; stats = login_status_checker.check_batch_accounts(batch_size=100); print('\n========================================'); print('测试结果:'); print('========================================'); print(json.dumps(stats, indent=2, ensure_ascii=False))"

echo.
echo ========================================
echo   测试完成
echo ========================================
echo.
echo 提示:
echo   - logged_in = 在线
echo   - session_expired = 掉线
echo   - error = 检查失败
echo.
echo 数据库已更新,可以在前端账号列表中查看登录状态列
echo.

cd /d %ROOT%
pause
