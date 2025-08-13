#!/bin/bash

echo "🚀 Starting Vercel deployment for Angular Exam App..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the app
echo "🔨 Building the app..."
npm run build:vercel

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
