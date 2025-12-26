@echo off
echo Moving browsers from playwright-browsers to chromium folder...
xcopy "E:\SynapseAutomation\browsers\playwright-browsers\*" "E:\SynapseAutomation\browsers\chromium\" /E /I /Y
if errorlevel 1 (
    echo Failed to move browsers
    pause
    exit /b 1
)
echo Successfully moved browsers
rmdir /s /q "E:\SynapseAutomation\browsers\playwright-browsers"
echo Removed old playwright-browsers folder
pause
