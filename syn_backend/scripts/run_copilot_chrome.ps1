param(
    [string]$ChromePath = "browsers\chromium\chromium-1161\chrome-win\chrome.exe",
    [string]$ProfileDir = "syn_backend\.copilot-profiles\chromium"
)

$extensionPath = "syn_backend\social-media-copilot-api\output\chrome-mv3"

if (!(Test-Path $ChromePath)) {
    Write-Error "Chrome not found at: $ChromePath"
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

Start-Process -FilePath $ChromePath -ArgumentList ($chromeArgs + $args)
