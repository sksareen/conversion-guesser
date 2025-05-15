import { NextResponse } from 'next/server';
import { supabase, dbToAppLeaderboardEntry, appToDbLeaderboardEntry } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/lib/store';

// GET /api/leaderboard - Get the leaderboard entries
export async function GET() {
  try {
    // Check if Supabase credentials are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase credentials not configured');
      return NextResponse.json({ 
        error: 'Database configuration missing', 
        leaderboard: [] 
      }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch leaderboard: ' + error.message,
        leaderboard: []
      }, { status: 200 });
    }
    
    const leaderboard = data ? data.map(dbToAppLeaderboardEntry) : [];
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      leaderboard: [] 
    }, { status: 200 });
  }
}

// POST /api/leaderboard - Add or update a leaderboard entry
export async function POST(request: Request) {
  try {
    // Check if Supabase credentials are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase credentials not configured');
      return NextResponse.json({ 
        error: 'Database configuration missing', 
        leaderboard: [] 
      }, { status: 200 });
    }
    
    const body = await request.json();
    const { username, averageError, totalGuesses, bestError, performanceLevel, totalPoints } = body;
    
    if (!username) {
      return NextResponse.json({ 
        error: 'Username is required',
        leaderboard: []  
      }, { status: 200 });
    }
    
    try {
      // Check if user already exists in leaderboard
      const { data: existingUser, error: existingUserError } = await supabase
        .from('leaderboard')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing user:', existingUserError);
        return NextResponse.json({ 
          error: 'Database error: ' + existingUserError.message,
          leaderboard: [] 
        }, { status: 200 });
      }
      
      const dbEntry = appToDbLeaderboardEntry(
        username, 
        averageError, 
        totalGuesses, 
        bestError, 
        performanceLevel,
        totalPoints || 0
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
        return NextResponse.json({ 
          error: 'Failed to update leaderboard: ' + result.error.message,
          leaderboard: [] 
        }, { status: 200 });
      }
      
      // Fetch the updated leaderboard
      const { data: updatedLeaderboard, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(20);
      
      if (fetchError) {
        console.error('Error fetching updated leaderboard:', fetchError);
        return NextResponse.json({ 
          error: 'Failed to fetch updated leaderboard: ' + fetchError.message,
          leaderboard: [] 
        }, { status: 200 });
      }
      
      const leaderboard = updatedLeaderboard ? updatedLeaderboard.map(dbToAppLeaderboardEntry) : [];
      return NextResponse.json({ leaderboard });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json({ 
        error: 'Database operation failed',
        leaderboard: [] 
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      leaderboard: [] 
    }, { status: 200 });
  }
}