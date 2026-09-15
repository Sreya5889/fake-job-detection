$backendCmd = 'cmd.exe /c cd /d c:\Users\DELL\Downloads\hireguard\backend && node src/server.js > server.log 2>&1'
$frontendCmd = 'cmd.exe /c cd /d c:\Users\DELL\Downloads\hireguard && set CI=true && node node_modules\vite\bin\vite.js --port 5173 --host > vite.log 2>&1'

$backend = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $backendCmd }
$frontend = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $frontendCmd }

Write-Output "Backend Process ID: $($backend.ProcessId), ReturnValue: $($backend.ReturnValue)"
Write-Output "Frontend Process ID: $($frontend.ProcessId), ReturnValue: $($frontend.ReturnValue)"
