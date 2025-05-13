# Deploying to Vercel

This document provides step-by-step instructions for deploying the Guess the Conversion Game to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (you can sign up with your GitHub account)

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a GitHub repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/guess-conversion-game.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. Keep the default settings (Vercel will auto-detect Next.js)
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel
   ```bash
   vercel login
   ```

3. Deploy the application
   ```bash
   vercel
   ```

4. Follow the interactive prompts:
   - Set up and deploy? → `y`
   - Which scope? → Select your account
   - Link to existing project? → `n`
   - What's your project name? → `guess-conversion-game` (or any name)
   - In which directory is your code located? → `./`
   - Want to override settings? → `n`

## Troubleshooting

If you encounter issues during deployment:

1. Check Vercel build logs for specific errors:
   - Go to the deployment in your Vercel dashboard
   - Click on the deployment
   - Navigate to the "Logs" tab

2. Common issues:
   - **Module not found errors**: Make sure all imports use the correct paths.
   - **TypeScript errors**: Check for type issues in your components.
   - **Build timeout**: Simplify the build process if it's taking too long.

3. To debug locally:
   ```bash
   npm run build
   ```

## Custom Domain

To add a custom domain to your project:

1. Go to your project on the Vercel dashboard
2. Navigate to "Settings" → "Domains"
3. Add your domain and follow the verification instructions

## Environment Variables

If your project requires environment variables:

1. Go to your project on the Vercel dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the required variables

## Conclusion

Your application should now be live on Vercel! You can share the provided URL with others to access your Guess the Conversion Game.