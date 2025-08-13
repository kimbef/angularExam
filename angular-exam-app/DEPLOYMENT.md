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
3. **Build Command**: Use `npm run build:vercel`

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

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify Node.js version compatibility
3. Ensure all configuration files are present
4. Check for any console errors in the browser
