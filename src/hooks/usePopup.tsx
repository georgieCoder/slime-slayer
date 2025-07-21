import { useState } from 'react';
import { PopupText } from '@/components/UI/PopupText';

export const usePopup = () => {
  const [popupComponents, setPopupComponents] = useState<{node: React.ReactNode, id: number}[]>([]);

  const showPopup = (
    text: string,   
    duration?: number,
    position?: { x: string; y: string },
    rotation?: number,
    initialFontSize?: number,
    finalFontSize?: number,
    color1?: string,
    color2?: string,
    color3?: string,
  ) => {
    const id = Date.now() + Math.random();
    
    const popup = (
      <PopupText
        key={id}
        text={text}
        onComplete={() => {
          setPopupComponents(prev => prev.filter(p  => p.id !== id));
        }}
        duration={duration}
        position={position}
        rotation={rotation}
        initialFontSize={initialFontSize}
        finalFontSize={finalFontSize}
        color1={color1}
        color2={color2}
        color3={color3}
      />
    );

    setPopupComponents(prev => [...prev, {node: popup, id}]);
  };

  return { showPopup, popups: popupComponents.map(p => p.node) }
};