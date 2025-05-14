# Deployment Instructions for Guess the Conversion Game

The code has been successfully pushed to the GitHub repository: https://github.com/sksareen/conversion-guesser

## Deploying to Vercel (Web Dashboard)

1. Visit the Vercel dashboard: https://vercel.com/dashboard

2. Click on "Add New..." and select "Project"

3. Import the GitHub repository:
   - Find and select `sksareen/conversion-guesser`
   - If you don't see it, you may need to click "Import Git Repository" and enter the URL: https://github.com/sksareen/conversion-guesser

4. Configure the project:
   - **Framework Preset**: Select "Next.js"
   - **Root Directory**: Keep as `.`
   - **Build Command**: `next build`
   - **Install Command**: `npm install`
   - **Development Command**: `next dev`
   
   Note: Do NOT set an output directory as we are using API routes now.

5. Click "Deploy"

6. Wait for the deployment to complete

7. Your site will be available at a URL like: `https://conversion-guesser.vercel.app` (the exact URL will be shown in your dashboard)

## Troubleshooting

If you encounter any issues with the deployment:

1. Check the build logs in the Vercel dashboard for specific errors

2. Common issues might include:
   - Missing dependencies
   - TypeScript errors
   - Next.js configuration issues

3. Update the GitHub repository with any fixes and Vercel will automatically redeploy

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" → "Domains"
3. Add your domain and follow the verification steps

## Sharing Your Project

Once deployed, you can share the Vercel URL with others to let them play the game. The game uses Supabase for the leaderboard functionality, which requires server-side API routes to be enabled.

## Local Testing

To test the build locally before deployment:

```bash
npm run build
npm run start
```

This will create a server-side rendered application that includes API routes for the leaderboard functionality. You can access it at http://localhost:3000.