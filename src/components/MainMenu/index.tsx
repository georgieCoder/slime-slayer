import React, { useRef, useState } from 'react';
import { mainEvents } from '@/MainEvents';
import './style.css'

import { InformationPanel } from '../InformationPanel';
import { useGameStore } from '@/stores';

export const MainMenu: React.FC<{}> = () => {
  const descriptionChecked = useGameStore(store => store.descriptionChecked);
  const [informationVisible, setInformationVisible] = useState(false);
  const [sleepingSlimeStatus, setSleepingSlimeStatus] = useState<0 | 1 | 2>(0);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const playButtonSVGRef = useRef<SVGSVGElement | null>(null);
  const playButtonClicked = useRef<boolean>(false);

  const onPlayClick = () => {
    if (!playButtonClicked.current) {
        if (playButtonRef.current) playButtonRef.current.disabled = true;
        playButtonSVGRef.current?.classList.remove('svg_clickable');
        playButtonClicked.current = true;

        setSleepingSlimeStatus(1);

        setTimeout(() => {
          setSleepingSlimeStatus(2)
          setTimeout(() => {
              mainEvents.emit('START_LOADING')
          }, 500)
        }, 750);
    }
  }

  const onAboutButtonClick = () => {
    setInformationVisible(prev => !prev);
    if (!descriptionChecked) {
      localStorage.setItem('description-checked', JSON.stringify(true));
      useGameStore.setState({ descriptionChecked: true })
    }
  }

  return (
    <div className="main-screen">
      <div className="main-screen_background image"></div>
      <div 
        onClick={onAboutButtonClick} 
        className="main-screen_about question-sign icon"
      >
      </div>
      {!descriptionChecked && <span id='new-description-label'>new!</span>}
      <div className="main-screen_play-btn play-btn">
        <button ref={playButtonRef} className="play-btn_text " onClick={onPlayClick}>
          <svg ref={playButtonSVGRef} className="image svg_clickable" viewBox="0 0 112.93 22.78">
                <path className="st0" d="M18.47,0.04v22.78h-5.64v-9.58h-1.65v1.95H9.47v1.79H7.56v2H5.64v3.8H0V0h5.64v9.53h1.92v-2h1.71V5.75h1.91
                    V3.79h1.65V0.04H18.47z M21.83,0v22.78h5.64V5.64h8.07V0H21.83z M54.07,1.83v9.56h-1.92v1.85h-3.73v1.95h-5.75v7.59h-5.65V0h13.36
                    v1.83H54.07z M49.27,4.66h-6.6v5.81h3.89V9.51h1.86v-1h0.85V4.66z M61.57,16.92v3.93h0.1v-3.93H61.57z M76.82,17.08v5.7h-5.69v-1.93
                    h-1.86v-3.93h-7.7v3.93h-1.81v1.93h-5.69v-5.7h1.91v-3.84h1.98v-5.7h1.75V3.75h1.86V0.03h7.7v1.8h1.86v5.79h1.91v3.93h1.92v5.53
                    H76.82z M68.25,12.26V7.62H67.4V4.69h-2.91v1.92h-0.85v3.86h0.85v1.79H68.25z M112.93,11.39v7.54H111v1.92h-1.91v1.93H95.87V0h5.65
                    v7.62h7.57v1.84H111v1.93H112.93z M105.37,17.92V16.2h1.91v-3.93h-5.76v5.65H105.37z M76.82,0v5.66h5.69v17.12h5.65V5.66h5.82V0
                    H76.82z"
                />
          </svg>
        </button>
        <div className="play-btn_slime">
          {sleepingSlimeStatus === 0 && <div className="image sleeping-slime_sleep"></div>}
          {sleepingSlimeStatus === 1 && <div className="image sleeping-slime_awake"></div>}
          {sleepingSlimeStatus === 2 && <div className="image sleeping-slime_awaken"></div>}
        </div>
      </div>
      <InformationPanel visible={informationVisible} setVisible={setInformationVisible} />
    </div>
  );
};