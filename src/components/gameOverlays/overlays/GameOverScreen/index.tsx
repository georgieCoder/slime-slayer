import { Panel } from '@/components/UI/Panel';
import './style.css';

export const GameOverScreen: React.FC = () => {
  return (
    <div className="game-over-screen_container overlay">
        <Panel>
          <div className="game-over-screen_death-image icon"></div>
          <div className="game-over-screen_content">
            <div className="game-over-screen_frame icon">
              <h2 className="game-over-screen_label">Поражение</h2>
            </div>
            <p className="game-over-screen_hint">Нажми любую клавишу чтобы начать сначала</p>
          </div>
        </Panel>
    </div>
  );
};