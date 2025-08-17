Write-Host "🧪 Testing deployment configuration..." -ForegroundColor Blue

# Check if all required files exist
Write-Host "📁 Checking required files..." -ForegroundColor Blue
$requiredFiles = @("vercel.json", "package.json", "angular.json", ".nvmrc", ".vercelignore")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Check Node.js version
Write-Host "🔍 Checking Node.js version..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not available" -ForegroundColor Red
    exit 1
}

# Check if Angular CLI is available
Write-Host "🔍 Checking Angular CLI..." -ForegroundColor Blue
try {
    $angularVersion = npx @angular/cli@19.2.5 --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Angular CLI available" -ForegroundColor Green
    } else {
        Write-Host "❌ Angular CLI not available" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Angular CLI not available" -ForegroundColor Red
}

# Test build
Write-Host "🔨 Testing build..." -ForegroundColor Blue
npm run vercel-build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Check if dist/browser exists
    if (Test-Path "dist/browser") {
        Write-Host "✅ Build output directory exists" -ForegroundColor Green
        Get-ChildItem "dist/browser" | Format-Table Name, Length
    } else {
        Write-Host "❌ Build output directory missing" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All tests passed! Ready for deployment." -ForegroundColor Green
