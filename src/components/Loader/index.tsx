import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { mainEvents } from '@/MainEvents';
import { gameEvents } from '@/GameEvents';
import { preloadResources } from '@/utils/preload';

import tutorial from '@/assets/game_overlays/tutorial.webp';
import victoryLabel from '@/assets/game_overlays/victory-text.webp';

export const Loader: React.FC = () => {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const slimeRef = useRef<HTMLDivElement | null>(null);
  const smokeRef = useRef<HTMLDivElement | null>(null);
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [realProgress, setRealProgress] = useState<number>(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [maxTranslate, setMaxTranslate] = useState(162);
  const minimumDuration = 1500;

  useEffect(() => {
    const updateMaxTranslate = () => {
      if (!loaderRef.current) return;
      const newMaxTranslate = loaderRef.current.clientWidth * 0.52;
      setMaxTranslate(newMaxTranslate);
    };

    updateMaxTranslate();
    window.addEventListener('resize', updateMaxTranslate);

    return () => {
      window.removeEventListener('resize', updateMaxTranslate);
    };
  }, [loaderRef]);

  useEffect(() => {
    if (gameLoaded && assetsLoaded) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minimumDuration - elapsed);
      
      setTimeout(() => {
        loaderRef.current?.classList.remove('visible');
        mainEvents.emit('STOP_LOADING');
      }, remainingTime);
    }
  }, [gameLoaded, assetsLoaded]);

  useEffect(() => {
    loaderRef.current?.classList.add('visible');
    startTimeRef.current = Date.now();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressRatio = Math.min(elapsed / minimumDuration, 1);

      const targetProgress = Math.min(realProgress, 1);
      const smoothProgress = displayProgress + (targetProgress - displayProgress) * 0.1;

      const combinedProgress = Math.max(
        progressRatio * 0.3,
        smoothProgress
      );
      
      const currentProgress = Math.min(combinedProgress, 1);
      setDisplayProgress(currentProgress);

      const translateX = currentProgress * maxTranslate;

      if (barRef.current) {
        barRef.current.style.transform = `translateX(${translateX}px)`;
      }
      if (slimeRef.current) {
        slimeRef.current.style.transform = `translateX(${translateX}px)`;
      }
      if (smokeRef.current) {
        smokeRef.current.style.transform = `translateX(${translateX}px)`;
      }

      if (currentProgress < 1 || elapsed < minimumDuration) {
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animateProgress);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [realProgress, displayProgress, maxTranslate]);

  useEffect(() => {
    const onLoadProgressEvent = (progress: number) => {
      setRealProgress(progress);
    };
    
    const onGameStartedEvent = () => {
      setRealProgress(1);
      setGameLoaded(true);
    };

    const preloadAssets = async () => {
        try {
          await preloadResources(
            [ 
              tutorial,
              victoryLabel
            ], 
            'image'
          );
          setAssetsLoaded(true);
        } catch (error) {
          console.error('Preloading failed:', error);
          setAssetsLoaded(false);
        }
    };

    preloadAssets();

    gameEvents.on('LOAD_PROGRESS', onLoadProgressEvent);
    gameEvents.on('GAME_STARTED', onGameStartedEvent);

    return () => {
      gameEvents.off('LOAD_PROGRESS', onLoadProgressEvent);
      gameEvents.off('GAME_STARTED', onGameStartedEvent);
    };
  }, []);

  return (
    <div className="loader image overlay" ref={loaderRef}>
      <div className="loader_loading-bar">
        <div className="loader_loading-bar__content">
          <div className="loader_loading-bar__bar image" ref={barRef}></div>
        </div>
        <div className="loader_loading-bar__frame image"></div>
        <div className="loader_loading-bar__slime" ref={slimeRef}>
          <div className="icon yellow-slime"></div>
        </div>
        <div className="loader_loading-bar__smoke" ref={smokeRef}>
          <div className="icon white-smoke"></div>
        </div>
      </div>
    </div>
  );
};