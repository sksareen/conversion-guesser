// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ScoreEntry {
  id: string;
  product: string;
  funnel: string;
  guess: number;
  actual: number;
  error: number;
  points: number; // Points earned for this guess
  accuracyPercentage: number; // New field: accuracy percentage
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  averageError: number;
  totalGuesses: number;
  bestError: number;
  averageAccuracy: number; // Changed from totalPoints to averageAccuracy
  performanceLevel: string;
  lastUpdated: number;
}

interface GameState {
  scores: ScoreEntry[];
  username: string;
  globalLeaderboard: LeaderboardEntry[];
  totalPoints: number; // Legacy field, kept for backward compatibility
  averageAccuracy: number; // New field: average accuracy percentage
  lastPoints: number; // Points from last guess
  addScore: (score: Omit<ScoreEntry, 'points' | 'accuracyPercentage'>) => void;
  clearScores: () => void;
  setUsername: (name: string) => void;
  updateLeaderboard: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  resetLeaderboard: () => Promise<void>;
  calculatePoints: (error: number) => number; // Helper to calculate points
  calculateAccuracyPercentage: (error: number) => number; // New helper
  isLoading: boolean;
}

// TypeScript type for the set function
type SetState = (
  partial: GameState | Partial<GameState> | ((state: GameState) => GameState | Partial<GameState>),
  replace?: boolean
) => void;

// Create a basic version of the store
const createBaseStore = (set: SetState, get: () => GameState) => ({
  scores: [],
  username: 'Anonymous',
  globalLeaderboard: [],
  totalPoints: 0,
  averageAccuracy: 0,
  lastPoints: 0,
  isLoading: false,
  
  // Calculate points based on error (legacy method)
  calculatePoints: (error: number) => {
    // Perfect guess (≤ 1% error): 100 points
    if (error <= 1) return 100;
    // Very close (≤ 3% error): 75 points
    if (error <= 3) return 75;
    // Good guess (≤ 5% error): 50 points
    if (error <= 5) return 50;
    // Decent guess (≤ 10% error): 25 points
    if (error <= 10) return 25;
    // OK guess (≤ 15% error): 10 points
    if (error <= 15) return 10;
    // Poor guess (≤ 20% error): 5 points
    if (error <= 20) return 5;
    // Bad guess (> 20% error): 1 point for trying
    return 1;
  },
  
  // Calculate accuracy percentage based on error
  calculateAccuracyPercentage: (error: number) => {
    // Simple formula: 100% - error%, but capped at 0
    return Math.max(0, 100 - error);
  },
  
  addScore: (scoreData) => {
    const points = get().calculatePoints(scoreData.error);
    const accuracyPercentage = get().calculateAccuracyPercentage(scoreData.error);
    const score = { ...scoreData, points, accuracyPercentage };
    
    set((state: GameState) => {
      const newScores = [...state.scores, score];
      // Calculate new average accuracy
      const totalAccuracy = newScores.reduce((sum, s) => sum + s.accuracyPercentage, 0);
      const newAverageAccuracy = totalAccuracy / newScores.length;
      
      return { 
        scores: newScores,
        totalPoints: state.totalPoints + points, // Keep for backward compatibility
        lastPoints: points,
        averageAccuracy: newAverageAccuracy
      };
    });
  },
  
  clearScores: () => set({ scores: [], totalPoints: 0, lastPoints: 0, averageAccuracy: 0 }),
  
  setUsername: (name: string) => set({ username: name.slice(0, 10) }), // Limit to 10 chars
  
  updateLeaderboard: async () => {
    const state = get();
    if (state.scores.length === 0) return;
    
    // Only update leaderboard if player has made at least 5 guesses
    const hasMinimumGuesses = state.scores.length >= 5;
    
    const averageError = state.scores.reduce((sum, s) => sum + s.error, 0) / state.scores.length;
    const bestError = Math.min(...state.scores.map(s => s.error));
    const averageAccuracy = state.averageAccuracy;
    
    let performanceLevel = "Funnel Novice";
    if (averageError <= 5) performanceLevel = "Conversion Wizard";
    else if (averageError <= 10) performanceLevel = "Funnel Expert";
    else if (averageError <= 15) performanceLevel = "Marketing Pro";
    else if (averageError <= 20) performanceLevel = "Funnel Student";
    
    set({ isLoading: true });
    
    try {
      // Send the leaderboard entry to the API even if they don't have enough guesses yet
      // This will store their progress, but API will only return entries with 5+ guesses
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: state.username,
          averageError,
          totalGuesses: state.scores.length,
          bestError,
          averageAccuracy, // Sending averageAccuracy to API
          totalPoints: state.totalPoints, // Keep for backward compatibility
          performanceLevel
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update leaderboard:', errorData);
        throw new Error(errorData.error || 'Failed to update leaderboard');
      }
      
      const data = await response.json();
      // Handle case where leaderboard might not be in the expected format
      const leaderboard = data.leaderboard || [];
      set({ globalLeaderboard: leaderboard, isLoading: false });
      
      // Debug info
      console.info(`Leaderboard updated for ${state.username} with ${state.scores.length} guesses`);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      set({ isLoading: false });
    }
  },
  
  fetchLeaderboard: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch leaderboard:', errorData);
        throw new Error(errorData.error || 'Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      // Handle case where leaderboard might not be in the expected format
      const leaderboard = data.leaderboard || [];
      set({ globalLeaderboard: leaderboard, isLoading: false });
      
      // Log for debugging
      if (leaderboard.length === 0) {
        console.info('Leaderboard is empty');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      set({ isLoading: false });
    }
  },
  
  resetLeaderboard: async () => {
    // This would typically be an admin-only function
    // For demo purposes, we'll just clear the local copy
    set({ globalLeaderboard: [] });
  }
});

// Type for the get and api functions
type GetState = () => GameState;
type StoreApi = {
  setState: SetState;
  getState: GetState;
  subscribe: (listener: (state: GameState, prevState: GameState) => void) => () => void;
  destroy: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set: SetState, get: GetState, api: StoreApi) => ({
      ...createBaseStore(set, get),
      addScore: (score) => {
        // Skip during SSR
        if (typeof window === 'undefined') return;
        
        // Add score to local state
        createBaseStore(set, get).addScore(score);
        
        // Add a slight delay before updating leaderboard to ensure state is updated
        setTimeout(() => {
          get().updateLeaderboard();
        }, 100);
      },
      clearScores: () => {
        createBaseStore(set, get).clearScores();
      },
      setUsername: (name: string) => {
        if (typeof window === 'undefined') return;
        createBaseStore(set, get).setUsername(name);
      }
    }),
    {
      name: 'funnel-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        scores: state.scores,
        username: state.username,
        totalPoints: state.totalPoints,
        lastPoints: state.lastPoints,
        averageAccuracy: state.averageAccuracy
      }),
    }
  )
);
