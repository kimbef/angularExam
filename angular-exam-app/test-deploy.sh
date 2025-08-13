#!/bin/bash

echo "🧪 Testing deployment configuration..."

# Check if all required files exist
echo "📁 Checking required files..."
required_files=("vercel.json" "package.json" "angular.json" ".nvmrc" ".vercelignore")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check Node.js version
echo "🔍 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Check if Angular CLI is available
echo "🔍 Checking Angular CLI..."
if npx @angular/cli@19.2.5 --version &> /dev/null; then
    echo "✅ Angular CLI available"
else
    echo "❌ Angular CLI not available"
fi

# Test build
echo "🔨 Testing build..."
if npm run vercel-build; then
    echo "✅ Build successful!"
    
    # Check if dist/browser exists
    if [ -d "dist/browser" ]; then
        echo "✅ Build output directory exists"
        ls -la dist/browser/
    else
        echo "❌ Build output directory missing"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 All tests passed! Ready for deployment."
