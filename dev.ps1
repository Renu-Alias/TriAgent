param(
    [string]$ServerHost = "127.0.0.1",
    [int]$ApiPort = 8000,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

function Get-PythonCommand {
    if (Get-Command python -ErrorAction SilentlyContinue) {
        return @{
            Command = "python"
            Arguments = @()
        }
    }

    if (Get-Command py -ErrorAction SilentlyContinue) {
        return @{
            Command = "py"
            Arguments = @("-3")
        }
    }

    throw "Python was not found. Install Python or ensure 'python' or 'py' is on PATH."
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root "frontend"
$pythonCommand = Get-PythonCommand

$viteCommand = "Set-Location '$frontendDir'; npm.cmd run dev -- --host $ServerHost --port $FrontendPort"

Write-Host "Starting Vite in a separate PowerShell window on http://$ServerHost`:$FrontendPort" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $viteCommand | Out-Null

Write-Host "Starting FastAPI on http://$ServerHost`:$ApiPort" -ForegroundColor Green
& $pythonCommand.Command @($pythonCommand.Arguments) -m uvicorn app.main:app --reload --host $ServerHost --port $ApiPort
