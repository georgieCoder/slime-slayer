import { Game } from 'phaser';
import { create } from 'zustand';

interface GameState {
  gameStarted: boolean;
  showLoader: boolean;
  showMainMenu: boolean;
  victory: boolean;
  waveCount: number;
  pause: boolean;
  gameOver: boolean;
  startPlaying: boolean;
  currentWave: number;
  score: number;
  gameInstance: Game | null;
  descriptionChecked: boolean;
  
  resetGameState: () => void;
  setScore: (score: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameStarted: false,
  showLoader: false,
  showMainMenu: true,
  victory: false,
  waveCount: 0,
  pause: false,
  gameOver: false,
  startPlaying: false,
  currentWave: 0,
  score: 0,
  gameInstance: null,
  descriptionChecked: true,

  resetGameState: () => set({
    victory: false,
    gameOver: false,
    pause: false,
    startPlaying: false,
    currentWave: 0,
    score: 0
  }),

  setScore: (score) => set({ score }),
}));