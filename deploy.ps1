param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Message
)

$ErrorActionPreference = "Stop"

function Run-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  Write-Host ">> $Command" -ForegroundColor DarkYellow
  Invoke-Expression $Command
}

Write-Host "Starting deploy helper..." -ForegroundColor Cyan

$insideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $insideRepo -ne "true") {
  throw "This script must be run inside a Git repository."
}

$status = git status --short
if (-not $status) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
  exit 0
}

Run-Step 'git add .'
Run-Step "git commit -m `"$Message`""
Run-Step 'git push'

Write-Host "Deploy complete. Vercel should start a new deployment automatically." -ForegroundColor Green
