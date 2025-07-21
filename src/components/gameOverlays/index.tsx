import { useGameStore } from "@/stores/gameStore";
import { WaveSystem, StartScreenHint, PauseScreen, GameOverScreen, ScoreSystem, VictoryScreen, GameEventsVisualizer } from "./overlays";
import './style.css';

export const GameOverlayManager = () => {
  const { 
    victory, 
    pause, 
    gameOver, 
    startPlaying 
  } = useGameStore();

  return (
    <div className="game-overlay overlay">
      {victory && <VictoryScreen />}
      {!startPlaying && <StartScreenHint />}
      {pause && <PauseScreen />}
      {gameOver && <GameOverScreen />}
      <ScoreSystem />
      <WaveSystem />
      <GameEventsVisualizer />
    </div>
  );
};