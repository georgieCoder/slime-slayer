import { useEffect, useState } from 'react';
import './style.css';

interface PopupTextProps {
  text: string;
  onComplete?: () => void;
  duration?: number;
  position?: { x: string; y: string };
  rotation?: number;
  initialFontSize?: number;
  finalFontSize?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

export const PopupText: React.FC<PopupTextProps> = ({
  text,
  onComplete,
  duration = 3000,
  position = { x: '50%', y: '50%' },
  rotation = 0,
  initialFontSize = 50,
  finalFontSize = 100,
  color1 = 'white',
  color2 = 'red',
  color3 = 'yellow' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  const style = {
    '--duration': `${duration}ms`,
    '--rotation': `${rotation}deg`,
    '--position-x': position.x,
    '--position-y': position.y,
    '--initial-font-size': `${initialFontSize}px`,
    '--final-font-size': `${finalFontSize}px`,
    '--color1': color1,
    '--color2': color2,
    '--color3': color3,
  } as React.CSSProperties;

  return (
    <div className="popup-text" style={style}>
      {text}
    </div>
  );
};

export default PopupText;