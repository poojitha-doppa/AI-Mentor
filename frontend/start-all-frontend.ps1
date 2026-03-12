# Unified Frontend Starter Script
# Starts all frontend applications with the shared header

Write-Host "🚀 Starting All Career Sync Frontend Applications..." -ForegroundColor Cyan
Write-Host ""

# Check if shared assets are copied
$sharedHeaderExists = Test-Path "c:\Users\vamsi\Desktop\Project Expo\frontend\landing-page\public\shared-header.js"
if (-not $sharedHeaderExists) {
    Write-Host "📋 Copying shared assets first..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
    & "c:\Users\vamsi\Desktop\Project Expo\frontend\copy-shared-assets.ps1"
    Write-Host ""
}

# Define applications
$apps = @(
    @{
        Name = "Landing Page"
        Path = "c:\Users\vamsi\Desktop\Project Expo\frontend\landing-page"
        Port = 4173
        Command = "npm run dev"
        Emoji = "🏠"
    },
    @{
        Name = "Course Generation"
        Path = "c:\Users\vamsi\Desktop\Project Expo\frontend\course-generation"
        Port = 3002
        Command = "npm run dev"
        Emoji = "📚"
    },
    @{
        Name = "Roadmap Generator"
        Path = "c:\Users\vamsi\Desktop\Project Expo\frontend\roadmap"
        Port = 5173
        Command = "npm run dev"
        Emoji = "🗺️"
    },
    @{
        Name = "Skill Evaluator"
        Path = "c:\Users\vamsi\Desktop\Project Expo\frontend\test-generation"
        Port = 3001
        Command = "npm run dev"
        Emoji = "✅"
    }
)

Write-Host "Starting applications:" -ForegroundColor Green
foreach ($app in $apps) {
    Write-Host "$($app.Emoji) $($app.Name) - http://localhost:$($app.Port)" -ForegroundColor Cyan
}
Write-Host ""

# Start each application in a new PowerShell window
foreach ($app in $apps) {
    $command = "cd '$($app.Path)'; npm run dev; pause"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
    Write-Host "✅ Started $($app.Name)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✨ All applications are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your apps at:" -ForegroundColor Cyan
Write-Host "  🏠 Landing Page:       http://localhost:4173" -ForegroundColor White
Write-Host "  📚 Course Generation:  http://localhost:3002" -ForegroundColor White
Write-Host "  🗺️ Roadmap Generator:  http://localhost:5173" -ForegroundColor White
Write-Host "  ✅ Skill Evaluator:    http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop applications" -ForegroundColor Yellow
