import { useEffect } from 'react';
import { mainEvents } from '@/MainEvents';
import { useGameStore } from '@/stores/gameStore';

export const useMainEvents = () => {
  useEffect(() => {
    const onStartLoading = async () => {
      useGameStore.setState({ showLoader: true });
      setTimeout(() => useGameStore.setState({ showMainMenu: false }), 1000);
      await import('phaser');
      const { initGame } = await import('@/game/game');
      const game = initGame();
      useGameStore.setState({ gameInstance: game })
    };

    const onStopLoading = () => useGameStore.setState({ showLoader: false });
    const onRestart = () => useGameStore.getState().resetGameState();

    mainEvents.on('START_LOADING', onStartLoading);
    mainEvents.on('STOP_LOADING', onStopLoading);
    mainEvents.on('RESTART', onRestart);

    return () => {
      mainEvents.off('START_LOADING', onStartLoading);
      mainEvents.off('STOP_LOADING', onStopLoading);
      mainEvents.off('RESTART', onRestart);
    };
  }, []);
};