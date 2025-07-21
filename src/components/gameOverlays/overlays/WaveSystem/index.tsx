import { useGameStore } from "@/stores";
import { useEffect, useRef } from "react";
import './style.css';
import { usePopup } from "@/hooks";
import { randomInt } from "@/utils/math";

export const WaveSystem: React.FC = () => {
    const { 
        currentWave, 
        waveCount 
    } = useGameStore();
    const lastWave = useRef(currentWave);

    const { showPopup, popups } = usePopup();

    useEffect(() => {
        if (currentWave > lastWave.current && currentWave !== waveCount) {
            lastWave.current = currentWave;
            showPopup(
                `Волна ${currentWave}\nпройдена!`,
                1600,
                { x: '50%', y: '50%' },
                randomInt(-15, 15),
                Math.min(window.innerWidth * 0.094, window.innerHeight * 0.06),
                Math.min(window.innerWidth * 0.188, window.innerHeight * 0.12)
            );
            return;
        }
        if (currentWave === 0) {
            lastWave.current = 0;
        }
    }, [currentWave])

    return (
        <div className="wave-system overlay">
            <p className="current-wave">{`${currentWave}/${waveCount}`}</p>
            {popups}
        </div>
    )
}