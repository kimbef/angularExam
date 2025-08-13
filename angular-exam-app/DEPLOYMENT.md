# Vercel Deployment Guide for Angular Exam App

## Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository set up

## Quick Deploy Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from your project directory
```bash
cd angular-exam-app
vercel
```

### 4. Follow the prompts:
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `angular-exam-app` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: `N`

## Manual Deployment via GitHub

### 1. Push your code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Go to [vercel.com](https://vercel.com)
### 3. Click "New Project"
### 4. Import your GitHub repository
### 5. Configure build settings:
- Framework Preset: `Other`
- Build Command: `npm run build:vercel`
- Output Directory: `dist/browser`
- Install Command: `npm install`

## Configuration Files

### vercel.json
The app includes a `vercel.json` file with:
- Static build configuration
- Correct output directory (`dist/browser`)
- SPA routing support
- Custom build command

### .nvmrc
Specifies Node.js version 18 for compatibility.

### .vercelignore
Excludes unnecessary files from deployment.

## Troubleshooting

### Build Failures
1. **Node.js Version**: Ensure you're using Node.js 18+
2. **Dependencies**: Run `npm install` before building
3. **Build Command**: Use `npm run vercel-build` (not `npm run build:vercel`)

### Common Error: "npm error could not determine executable to run"
**Solution**: The app now uses `npx @angular/cli@19.2.5 build` instead of `ng build` to ensure the correct Angular CLI version is used in the Vercel environment.

**What was fixed**:
- Updated `vercel.json` to use `npm run vercel-build`
- Added `vercel-build` script that uses `npx @angular/cli@19.2.5 build`
- This ensures the exact Angular CLI version is used during build

### Runtime Errors
1. **Routing Issues**: The app includes SPA fallback routing
2. **API Calls**: App uses mock APIs, no backend required
3. **Environment Variables**: None required for this app

### Common Issues
1. **404 on Refresh**: SPA routing is configured in `vercel.json`
2. **Build Timeout**: Increase build timeout in Vercel dashboard if needed
3. **Memory Issues**: Ensure adequate memory allocation in Vercel

## Verification

After deployment:
1. Check that all routes work correctly
2. Test authentication flow
3. Verify post creation/editing functionality
4. Check responsive design on mobile

## Testing Deployment Configuration

Before deploying, test your configuration locally:

**Windows (PowerShell)**:
```powershell
.\test-deploy.ps1
```

**Linux/Mac**:
```bash
chmod +x test-deploy.sh
./test-deploy.sh
```

This will verify:
- All required files exist
- Node.js version is compatible
- Angular CLI is available
- Build process works correctly
- Output directory structure is correct

## Support

If you encounter issues:
1. **Run the test script first** to verify local configuration
2. Check Vercel build logs for specific error messages
3. Verify Node.js version compatibility (18+)
4. Ensure all configuration files are present
5. Check for any console errors in the browser
