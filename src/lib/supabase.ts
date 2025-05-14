import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log Supabase connection status (for debugging)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Leaderboard functionality will be unavailable.');
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type LeaderboardEntryDB = {
  id: string;
  username: string;
  average_error: number;
  total_guesses: number;
  best_error: number;
  performance_level: string;
  created_at: string;
  updated_at: string;
};

// Utility functions to convert between database and app formats
export const dbToAppLeaderboardEntry = (entry: LeaderboardEntryDB) => ({
  id: entry.id,
  username: entry.username,
  averageError: entry.average_error,
  totalGuesses: entry.total_guesses,
  bestError: entry.best_error,
  performanceLevel: entry.performance_level,
  lastUpdated: new Date(entry.updated_at).getTime()
});

export const appToDbLeaderboardEntry = (username: string, averageError: number, totalGuesses: number, bestError: number, performanceLevel: string) => ({
  username,
  average_error: averageError,
  total_guesses: totalGuesses,
  best_error: bestError,
  performance_level: performanceLevel
});