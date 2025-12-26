param(
    [string]$ChromeForTestingPath = "browsers\chrome-for-testing\chrome-143.0.7499.169\chrome-win64\chrome.exe",
    [string]$ProfileDir = "syn_backend\.copilot-profiles\chrome-for-testing"
)

$extensionPath = "syn_backend\social-media-copilot-api\output\chrome-mv3"

if (!(Test-Path $ChromeForTestingPath)) {
    Write-Error "Chrome for Testing not found at: $ChromeForTestingPath"
    exit 1
}
if (!(Test-Path $extensionPath)) {
    Write-Error "Extension path not found: $extensionPath"
    exit 1
}

New-Item -ItemType Directory -Force -Path $ProfileDir | Out-Null

$chromeArgs = @(
    "--load-extension=$extensionPath",
    "--disable-extensions-except=$extensionPath",
    "--user-data-dir=$ProfileDir",
    "--profile-directory=Default",
    "--no-first-run",
    "--no-default-browser-check"
)

Start-Process -FilePath $ChromeForTestingPath -ArgumentList ($chromeArgs + $args)
