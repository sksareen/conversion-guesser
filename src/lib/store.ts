import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useGameStore = create<GameState>(
  persist(
    (set) => ({
      scores: [],
      addScore: (score) => set((state) => ({ 
        scores: [...state.scores, score]
      })),
      clearScores: () => set({ scores: [] }),
    }),
    {
      name: 'funnel-game-storage',
    }
  )
);
