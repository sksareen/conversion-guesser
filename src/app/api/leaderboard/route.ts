import { NextResponse } from 'next/server';
import { supabase, dbToAppLeaderboardEntry, appToDbLeaderboardEntry } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/lib/store';

// GET /api/leaderboard - Get the leaderboard entries
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('average_error', { ascending: true })
      .limit(20);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
    
    const leaderboard = data.map(dbToAppLeaderboardEntry);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leaderboard - Add or update a leaderboard entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, averageError, totalGuesses, bestError, performanceLevel } = body;
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    
    // Check if user already exists in leaderboard
    const { data: existingUser } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('username', username)
      .single();
    
    const dbEntry = appToDbLeaderboardEntry(
      username, 
      averageError, 
      totalGuesses, 
      bestError, 
      performanceLevel
    );
    
    let result;
    if (existingUser) {
      // Update existing user
      result = await supabase
        .from('leaderboard')
        .update(dbEntry)
        .eq('username', username)
        .select();
    } else {
      // Create new user
      result = await supabase
        .from('leaderboard')
        .insert(dbEntry)
        .select();
    }
    
    if (result.error) {
      console.error('Error updating leaderboard:', result.error);
      return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
    }
    
    // Fetch the updated leaderboard
    const { data: updatedLeaderboard, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .order('average_error', { ascending: true })
      .limit(20);
    
    if (fetchError) {
      console.error('Error fetching updated leaderboard:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated leaderboard' }, { status: 500 });
    }
    
    const leaderboard = updatedLeaderboard.map(dbToAppLeaderboardEntry);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}