# Script to copy shared assets to all frontend applications
Write-Host "🔄 Copying shared header assets to all frontend apps..." -ForegroundColor Cyan

$sourceDir = "c:\Users\vamsi\Desktop\Project Expo\frontend"
$sharedFiles = @("shared-header.js", "shared-auth.js")

$targetDirs = @(
    "$sourceDir\landing-page\public",
    "$sourceDir\course-generation\public",
    "$sourceDir\roadmap\public",
    "$sourceDir\test-generation\public"
)

# Create public directories if they don't exist
foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Copy shared files to each target directory
foreach ($file in $sharedFiles) {
    $sourcePath = Join-Path $sourceDir $file
    if (Test-Path $sourcePath) {
        foreach ($targetDir in $targetDirs) {
            $targetPath = Join-Path $targetDir $file
            Copy-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "✅ Copied $file to $targetDir" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Source file not found: $sourcePath" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ All shared assets copied successfully!" -ForegroundColor Green
