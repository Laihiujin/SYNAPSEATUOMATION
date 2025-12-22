# Kill all processes using port 7000
$pids = @(29248, 101464)
foreach ($pid in $pids) {
    try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
        Write-Host "Killed process $pid"
    } catch {
        Write-Host "Process $pid not found or already terminated"
    }
}

# Wait a moment
Start-Sleep -Seconds 2

# Verify
$remaining = netstat -ano | Select-String ":7000" | Select-String "LISTENING"
if ($remaining) {
    Write-Host "WARNING: Some processes still using port 7000:"
    Write-Host $remaining
} else {
    Write-Host "SUCCESS: Port 7000 is now free"
}
