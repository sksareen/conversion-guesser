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
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  averageError: number;
  totalGuesses: number;
  bestError: number;
  performanceLevel: string;
  lastUpdated: number;
}

interface GameState {
  scores: ScoreEntry[];
  username: string;
  globalLeaderboard: LeaderboardEntry[];
  addScore: (score: ScoreEntry) => void;
  clearScores: () => void;
  setUsername: (name: string) => void;
  updateLeaderboard: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  resetLeaderboard: () => Promise<void>;
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
  isLoading: false,
  addScore: (score: ScoreEntry) => set((state: GameState) => ({ 
    scores: [...state.scores, score]
  })),
  clearScores: () => set({ scores: [] }),
  setUsername: (name: string) => set({ username: name.slice(0, 10) }), // Limit to 10 chars
  updateLeaderboard: async () => {
    const state = get();
    if (state.scores.length === 0) return;
    
    const averageError = state.scores.reduce((sum, s) => sum + s.error, 0) / state.scores.length;
    const bestError = Math.min(...state.scores.map(s => s.error));
    
    let performanceLevel = "Conversion Novice";
    if (averageError <= 5) performanceLevel = "Marketing Guru";
    else if (averageError <= 10) performanceLevel = "Conversion Expert";
    else if (averageError <= 15) performanceLevel = "Digital Marketer";
    else if (averageError <= 20) performanceLevel = "Marketing Student";
    
    set({ isLoading: true });
    
    try {
      // Send the leaderboard entry to the API
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
          performanceLevel
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update leaderboard');
      }
      
      const data = await response.json();
      set({ globalLeaderboard: data.leaderboard, isLoading: false });
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
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      set({ globalLeaderboard: data.leaderboard, isLoading: false });
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
      addScore: (score: ScoreEntry) => {
        // Skip during SSR
        if (typeof window === 'undefined') return;
        
        // Add score to local state
        createBaseStore(set, get).addScore(score);
        
        // Update leaderboard whenever a new score is added
        get().updateLeaderboard();
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
        username: state.username 
      }),
    }
  )
);
