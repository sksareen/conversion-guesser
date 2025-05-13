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

// Create a basic version of the store
const createBaseStore = (set) => ({
  scores: [],
  addScore: (score) => set((state) => ({ 
    scores: [...state.scores, score]
  })),
  clearScores: () => set({ scores: [] }),
});

// Create the store with persistence middleware
export const useGameStore = create<GameState>()(
  (set, get, api) => ({
    ...createBaseStore(set),
    _hasHydrated: false,
    _hasCheckedStorage: false,
    addScore: (score) => {
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
