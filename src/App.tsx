import { MainMenu } from '@/components/MainMenu';
import { Loader } from '@/components/Loader';
import { useGameStore } from '@/stores';
import { useInputHandlers, useMainEvents, useGameEvents, usePopup, useResizeObserver } from '@/hooks';
import { GameOverlayManager } from '@/components/gameOverlays';
import '@/styles/global.css';
import '@/styles/ui.css';
import { useCallback, useEffect, useRef } from 'react';

export const App = () => {
  const {
    gameStarted,
    showLoader,
    showMainMenu,
    gameInstance
  } = useGameStore();

  const gameContainerRef = useRef<HTMLDivElement>(null);

  useGameEvents();
  useMainEvents();
  useInputHandlers();

  useEffect(() => {
    const descriptionWasChecked = localStorage.getItem('description-checked');

    const parsedLocalStorageItem = descriptionWasChecked && JSON.parse(descriptionWasChecked);
    !parsedLocalStorageItem && useGameStore.setState({ descriptionChecked: false });
  }, [])

  const changeSizeOfGame = useCallback((width: number, height: number) => {
    setTimeout(() => {
      if (!gameInstance) return;

      const gameWidth = 318;
      const gameHeight = 500;

      const targetWidthZoom = width / gameWidth;
      const targetHeightZoom = height / gameHeight

      gameInstance.scale.setZoom(Math.min(targetHeightZoom, targetWidthZoom))
    }, 100)
  }, [gameInstance])

  useResizeObserver((entry) => {
    const { width, height } = entry.contentRect;
    changeSizeOfGame(width, height)
  }, gameContainerRef)

  return (
    <div className="app_container">
      <div className="app" id="game-container" ref={gameContainerRef}>
        {gameStarted && <GameOverlayManager />}
        {showMainMenu && <MainMenu />}
        {showLoader && <Loader />}
        <div style={{display: !showLoader && gameStarted ? 'block' : 'none'}} className="game-container_frame image"></div>
      </div>
    </div>
  );
};