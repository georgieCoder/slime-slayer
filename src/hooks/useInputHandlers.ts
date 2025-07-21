// hooks/useInputHandlers.ts
import { useEffect } from 'react';
import { mainEvents } from '@/MainEvents';
import { useGameStore } from '@/stores/gameStore';

export const useInputHandlers = () => {
  const { startPlaying, pause, gameOver, victory, resetGameState, showLoader } = useGameStore();

  useEffect(() => {
    const handleStartPlaying = (event: KeyboardEvent | MouseEvent) => {
      if (!startPlaying && !showLoader) {
        event.preventDefault();
        event.stopPropagation();
        useGameStore.setState({ startPlaying: true });
        mainEvents.emit("START_PLAYING");
        document.removeEventListener('keydown', handleStartPlaying);
        document.removeEventListener('click', handleStartPlaying);
      }
    };

    if (!startPlaying && !showLoader) {
      document.addEventListener('keydown', handleStartPlaying);
      document.addEventListener('click', handleStartPlaying);
    }

    return () => {
      document.removeEventListener('keydown', handleStartPlaying);
      document.removeEventListener('click', handleStartPlaying);
    };
  }, [startPlaying, showLoader]);

  useEffect(() => {
    const handlePauseEvents = () => {
      if (!gameOver && startPlaying) {
        useGameStore.setState({ pause: true });
        mainEvents.emit("PAUSE");
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !gameOver && startPlaying) {
        useGameStore.setState(prev => {
          const newPause = !prev.pause;
          mainEvents.emit(newPause ? "PAUSE" : "RESUME");
          return { pause: newPause };
        });
      }
    };

    const handleResume = (e: KeyboardEvent | MouseEvent) => {
      if (pause) {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.setState({ pause: false });
        mainEvents.emit("RESUME");
      }
    };

    window.addEventListener('blur', handlePauseEvents);
    window.addEventListener('contextmenu', handlePauseEvents);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleResume);
    document.addEventListener('click', handleResume);

    return () => {
      window.removeEventListener('blur', handlePauseEvents);
      window.removeEventListener('contextmenu', handlePauseEvents);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleResume);
      document.removeEventListener('click', handleResume);
    };
  }, [pause, gameOver, startPlaying]);

  useEffect(() => {
    const handleRestart = (e: MouseEvent | KeyboardEvent) => {
      if (gameOver && !pause) {
        resetGameState();
        mainEvents.emit("RESTART");
        return;
      }
      if (victory && !pause) {
        if (e instanceof KeyboardEvent) {
          if (e.code !== 'KeyR') return;
        }
        resetGameState();
        mainEvents.emit("RESTART");
      }
    };

    if (gameOver || victory && !pause) {
      document.addEventListener('click', handleRestart);
      document.addEventListener('keydown', handleRestart);
    }

    return () => {
      document.removeEventListener('click', handleRestart);
      document.removeEventListener('keydown', handleRestart);
    };
  }, [gameOver, victory, resetGameState, pause]);
};