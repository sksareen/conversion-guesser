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
- Global leaderboard with Supabase database
- Citations to real data sources
- Keyboard shortcuts for faster navigation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand with localStorage persistence
- **Database**: Supabase
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

## Setting up Supabase

### 1. Create a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com/)
2. Create a new project with your preferred name and database password
3. Note your project URL and anon key (found in Project Settings > API)

### 2. Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Update the `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Set Up Database Tables

In your Supabase project, create the following table:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Create the leaderboard table by executing this SQL:

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  average_error NUMERIC NOT NULL,
  total_guesses INTEGER NOT NULL,
  best_error NUMERIC NOT NULL,
  performance_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster queries
CREATE INDEX idx_leaderboard_username ON leaderboard(username);

-- Create RLS policies (optional but recommended for production)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to leaderboard
CREATE POLICY "Allow anonymous read access"
  ON leaderboard FOR SELECT
  USING (true);

-- Allow users to insert/update their own records
CREATE POLICY "Allow users to insert their own records"
  ON leaderboard FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own records"
  ON leaderboard FOR UPDATE
  USING (true);
```

### Resetting the Database

If you need to reset the leaderboard:

1. Go to your Supabase dashboard
2. Navigate to Table Editor > leaderboard
3. Use the "Delete" option to delete all rows, or execute this SQL in the SQL Editor:

```sql
TRUNCATE TABLE leaderboard;
```

For a complete reset (including the table structure):

```sql
DROP TABLE IF EXISTS leaderboard;
```

Then re-create the table using the "Set Up Database Tables" SQL above.

## Future Improvements

- Difficulty levels by industry
- Timer mode for competitive play
- Company filtering options
- More companies and conversion metrics
- Offline support with PWA capabilities
- User authentication and personalized leaderboards

## License

MIT

## Acknowledgements

- Data sources are linked with each company
- Company logos and branding elements
- Animations powered by Framer Motion
- Designed with Tailwind CSS
- Created by [a PM](https://savarsareen.com)