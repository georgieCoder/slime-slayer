import { Panel } from '@/components/UI/Panel';
import './style.css';

export const PauseScreen: React.FC = () => {
  return (
    <Panel>
      <div className="pause-screen_slime icon"></div>
      <div className="pause-screen_content">
        <div className="pause-screen_pause-icon icon"></div>
        <h2 className="pause-screen_label">пауза</h2>
        <p className="pause-screen_hint">Нажми любую клавишу чтобы продолжить</p>
      </div>
    </Panel>
  );
};