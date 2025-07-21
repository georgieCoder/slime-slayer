import './style.css';
import { useGameStore } from '@/stores';

export const ScoreSystem: React.FC = () => {
    const {
        score
    } = useGameStore()

    return (
        <div className="score-container">
            <div className="score image">
                <p>{score}</p>
            </div>
        </div>
    );
};