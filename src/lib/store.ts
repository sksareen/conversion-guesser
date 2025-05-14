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
      // Since we're using static export, we'll simulate a leaderboard with local data
      // Create a new leaderboard entry for the current user
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        username: state.username,
        averageError: averageError,
        totalGuesses: state.scores.length,
        bestError: bestError,
        performanceLevel: performanceLevel,
        lastUpdated: Date.now()
      };
      
      // Get current leaderboard
      const currentLeaderboard = [...get().globalLeaderboard];
      
      // Find if user already exists
      const existingEntryIndex = currentLeaderboard.findIndex(entry => entry.username === state.username);
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        currentLeaderboard[existingEntryIndex] = newEntry;
      } else {
        // Add new entry
        currentLeaderboard.push(newEntry);
      }
      
      // Sort by averageError (ascending)
      currentLeaderboard.sort((a, b) => a.averageError - b.averageError);
      
      // Limit to top 20
      const limitedLeaderboard = currentLeaderboard.slice(0, 20);
      
      // Update the store
      set({ globalLeaderboard: limitedLeaderboard, isLoading: false });
      
      // Store to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('conversion-game-leaderboard', JSON.stringify(limitedLeaderboard));
        } catch (e) {
          console.error('Failed to save leaderboard to localStorage:', e);
        }
      }
      
      console.info(`Local leaderboard updated for ${state.username} with ${state.scores.length} guesses`);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      set({ isLoading: false });
    }
  },
  fetchLeaderboard: async () => {
    set({ isLoading: true });
    
    try {
      // Load leaderboard from localStorage
      let leaderboard: LeaderboardEntry[] = [];
      
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('conversion-game-leaderboard');
          if (stored) {
            leaderboard = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Failed to load leaderboard from localStorage:', e);
        }
      }
      
      set({ globalLeaderboard: leaderboard, isLoading: false });
      
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
      addScore: (score: ScoreEntry) => {
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
        username: state.username 
      }),
    }
  )
);
