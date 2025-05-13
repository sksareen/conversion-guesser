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
  updateLeaderboard: () => void;
  addLeaderboardEntry: (entry: LeaderboardEntry) => void;
  resetLeaderboard: () => void;
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
  addScore: (score: ScoreEntry) => set((state: GameState) => ({ 
    scores: [...state.scores, score]
  })),
  clearScores: () => set({ scores: [] }),
  setUsername: (name: string) => set({ username: name.slice(0, 10) }), // Limit to 10 chars
  updateLeaderboard: () => {
    const state = get();
    if (state.scores.length === 0) return;
    
    const averageError = state.scores.reduce((sum, s) => sum + s.error, 0) / state.scores.length;
    const bestError = Math.min(...state.scores.map(s => s.error));
    
    let performanceLevel = "Conversion Novice";
    if (averageError <= 5) performanceLevel = "Marketing Guru";
    else if (averageError <= 10) performanceLevel = "Conversion Expert";
    else if (averageError <= 15) performanceLevel = "Digital Marketer";
    else if (averageError <= 20) performanceLevel = "Marketing Student";
    
    const entry: LeaderboardEntry = {
      id: state.username + '-' + Date.now(),
      username: state.username,
      averageError,
      totalGuesses: state.scores.length,
      bestError,
      performanceLevel,
      lastUpdated: Date.now()
    };
    
    get().addLeaderboardEntry(entry);
  },
  addLeaderboardEntry: (entry: LeaderboardEntry) => set((state: GameState) => {
    // Filter out old entries from same user
    const filteredLeaderboard = state.globalLeaderboard.filter(e => e.username !== entry.username);
    // Add new entry and sort by averageError (lowest first)
    const newLeaderboard = [...filteredLeaderboard, entry]
      .sort((a, b) => a.averageError - b.averageError)
      .slice(0, 20); // Keep only top 20 entries
    
    return { globalLeaderboard: newLeaderboard };
  }),
  resetLeaderboard: () => set({ globalLeaderboard: [] })
});

// Type for the get and api functions
type GetState = () => GameState;
type StoreApi = {
  setState: SetState;
  getState: GetState;
  subscribe: (listener: (state: GameState, prevState: GameState) => void) => () => void;
  destroy: () => void;
};

// Create the store with persistence middleware
export const useGameStore = create<GameState>()(
  (set: SetState, get: GetState, api: StoreApi) => ({
    ...createBaseStore(set, get),
    _hasHydrated: false,
    _hasCheckedStorage: false,
    addScore: (score: ScoreEntry) => {
      // Skip during SSR and ensure hydration
      if (typeof window === 'undefined') return;
      createBaseStore(set, get).addScore(score);
      
      // Save to localStorage directly (fallback if middleware fails)
      try {
        const current = [...get().scores, score];
        localStorage.setItem('funnel-game-storage', JSON.stringify({ 
          state: { 
            scores: current,
            username: get().username,
            globalLeaderboard: get().globalLeaderboard
          } 
        }));
        
        // Update leaderboard whenever a new score is added
        get().updateLeaderboard();
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    },
    clearScores: () => {
      createBaseStore(set, get).clearScores();
      
      // Clear localStorage directly (fallback)
      try {
        localStorage.setItem('funnel-game-storage', JSON.stringify({ 
          state: { 
            scores: [],
            username: get().username,
            globalLeaderboard: get().globalLeaderboard
          } 
        }));
      } catch (e) {
        console.warn('Failed to clear localStorage', e);
      }
    },
    setUsername: (name: string) => {
      if (typeof window === 'undefined') return;
      createBaseStore(set, get).setUsername(name);
      
      try {
        localStorage.setItem('funnel-game-storage', JSON.stringify({
          state: {
            scores: get().scores,
            username: name.slice(0, 10),
            globalLeaderboard: get().globalLeaderboard
          }
        }));
      } catch (e) {
        console.warn('Failed to save username to localStorage', e);
      }
    }
  })
);
