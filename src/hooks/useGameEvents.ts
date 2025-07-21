// hooks/useGameEvents.ts
import { useEffect } from 'react';
import { gameEvents } from '@/GameEvents';
import { useGameStore } from '@/stores';

export const useGameEvents = () => {
  const { resetGameState, setScore } = useGameStore();

  useEffect(() => {
    const onWaveComplete = () => {
        useGameStore.setState(prev => ({ currentWave: prev.currentWave + 1 }))
    };
    const onGameStarted = (restarted: boolean, currentWaveCount: number) => {
      if (!restarted) {
        useGameStore.setState({ 
          gameStarted: true,
          waveCount: currentWaveCount 
        });
      }
      resetGameState();
    };
    const onGameOver = () => useGameStore.setState({ gameOver: true });
    const onVictory = () => useGameStore.setState({ victory: true });
    const onChangeScore = (score: number) => setScore(score);

    gameEvents.on("WAVE_COMPLETE", onWaveComplete);
    gameEvents.on("GAME_STARTED", onGameStarted);
    gameEvents.on("GAME_OVER", onGameOver);
    gameEvents.on("VICTORY", onVictory);
    gameEvents.on("CHANGE_SCORE", onChangeScore);

    return () => {
      gameEvents.off("WAVE_COMPLETE", onWaveComplete);
      gameEvents.off("GAME_STARTED", onGameStarted);
      gameEvents.off("GAME_OVER", onGameOver);
      gameEvents.off("VICTORY", onVictory);
      gameEvents.off("CHANGE_SCORE", onChangeScore);
    };
  }, [resetGameState, setScore]);
};