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

interface GameState {
  scores: ScoreEntry[];
  addScore: (score: ScoreEntry) => void;
  clearScores: () => void;
}

// TypeScript type for the set function
type SetState = (
  partial: GameState | Partial<GameState> | ((state: GameState) => GameState | Partial<GameState>),
  replace?: boolean
) => void;

// Create a basic version of the store
const createBaseStore = (set: SetState) => ({
  scores: [],
  addScore: (score: ScoreEntry) => set((state: GameState) => ({ 
    scores: [...state.scores, score]
  })),
  clearScores: () => set({ scores: [] }),
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
    ...createBaseStore(set),
    _hasHydrated: false,
    _hasCheckedStorage: false,
    addScore: (score: ScoreEntry) => {
      // Skip during SSR and ensure hydration
      if (typeof window === 'undefined') return;
      createBaseStore(set).addScore(score);
      
      // Save to localStorage directly (fallback if middleware fails)
      try {
        const current = [...get().scores, score];
        localStorage.setItem('funnel-game-storage', JSON.stringify({ state: { scores: current } }));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    },
    clearScores: () => {
      createBaseStore(set).clearScores();
      
      // Clear localStorage directly (fallback)
      try {
        localStorage.setItem('funnel-game-storage', JSON.stringify({ state: { scores: [] } }));
      } catch (e) {
        console.warn('Failed to clear localStorage', e);
      }
    }
  })
);
