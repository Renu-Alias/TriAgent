param(
    [switch]$SkipBuild,
    [string]$ServerHost = "127.0.0.1",
    [int]$Port = 8000
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

if (-not $SkipBuild) {
    Write-Host "Building React frontend..." -ForegroundColor Cyan
    Push-Location $frontendDir
    try {
        & npm.cmd run build
    }
    finally {
        Pop-Location
    }
}

$pythonCommand = Get-PythonCommand

Write-Host "Starting FastAPI on http://$ServerHost`:$Port" -ForegroundColor Green
& $pythonCommand.Command @($pythonCommand.Arguments) -m uvicorn app.main:app --reload --host $ServerHost --port $Port
