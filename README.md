# Guess the Conversion Game

A GeoGuessr-style game where users predict real conversion rates from well-known companies like Airbnb, Netflix, and Spotify.

![Guess the Conversion Game](./public/favicon.svg)

## Overview

"Guess the Conversion" challenges you to predict actual conversion percentages from top tech companies across various marketing funnels and product metrics. How close can you get to the real numbers?

## Live Demo

Visit the live demo at [vercel-deployment-url] (to be added after deployment)

## Features

- 30 real funnel conversion statistics from recognizable companies
- Dramatic company reveal after each guess (like GeoGuessr)
- Company branding integration with logos and colors
- Engaging animations and visual feedback
- Performance levels based on your accuracy
- Mobile-first responsive design
- Score history with performance tracking
- Citations to real data sources
- Keyboard shortcuts for faster navigation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand with localStorage persistence
- **Deployment**: Vercel

## How to Play

1. You'll be presented with a company and funnel description
2. Guess the conversion percentage (between 0-100%)
3. Submit your guess to see the results with stats and sources
4. See your accuracy and performance metrics
5. Continue to the next company

## Performance Levels

Based on your average error margin, you'll receive a performance level:

- **Marketing Guru**: Avg. Error ≤ 5%
- **Conversion Expert**: Avg. Error ≤ 10%
- **Digital Marketer**: Avg. Error ≤ 15%
- **Marketing Student**: Avg. Error ≤ 20%
- **Conversion Novice**: Avg. Error > 20%

## Keyboard Shortcuts

- Press `N` to go to the next question
- Press `Esc` to skip the current question

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Deployment

### Deploying to Vercel

This project is configured for easy deployment with Vercel:

1. Fork or clone this repository
2. Import your repository on Vercel
3. Vercel will automatically detect the Next.js setup
4. Click "Deploy"

Alternatively, you can use the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Featured Companies

The game features real conversion statistics from recognizable companies:

| Company | Funnel | Conversion Rate | Source |
|---------|--------|----------------|--------|
| Airbnb | Visitor to booking conversion | 3.2% | [Backlinko](https://backlinko.com/airbnb-users) |
| Netflix | Free trial to paid conversion | 93.0% | [Business of Apps](https://www.businessofapps.com/data/netflix-statistics/) |
| Amazon | Prime free trial to paid | 70.0% | [Business of Apps](https://www.businessofapps.com/data/amazon-prime-statistics/) |
| Spotify | Free to premium conversion | 46.0% | [Business of Apps](https://www.businessofapps.com/data/spotify-statistics/) |
| Slack | Free to paid conversion | 30.0% | [ProfitWell](https://www.profitwell.com/recur/all/saas-freemium-conversion-rate) |

*See the complete dataset in `/src/data/companies.json`*

## Future Improvements

- Global leaderboard with backend integration
- Difficulty levels by industry
- Timer mode for competitive play
- Company filtering options
- More companies and conversion metrics
- Offline support with PWA capabilities

## License

MIT

## Acknowledgements

- Data sources are linked with each company
- Company logos and branding elements
- Animations powered by Framer Motion
- Designed with Tailwind CSS
- Created by [Savar Sareen](https://soversareen.com)