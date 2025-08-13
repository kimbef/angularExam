Write-Host "🚀 Starting Vercel deployment for Angular Exam App..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel CLI not found"
    }
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if user is logged in
try {
    $whoami = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Build the app
Write-Host "🔨 Building the app..." -ForegroundColor Blue
npm run build:vercel

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
    vercel --prod
    
    Write-Host "🎉 Deployment complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
