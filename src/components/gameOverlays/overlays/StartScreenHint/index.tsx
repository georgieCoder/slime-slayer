import './style.css';

export const StartScreenHint: React.FC = () => {
  return (
    <div className="start-screen-hint overlay">
      <div className="start-screen-hint_tutorial icon"></div>
      <h3 className="start-screen-hint_label hint">
        Нажми любую клавишу чтобы играть
      </h3>
    </div>
  );
};