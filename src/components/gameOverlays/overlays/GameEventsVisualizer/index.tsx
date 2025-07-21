import { useEffect } from 'react'
import { gameEvents } from '@/GameEvents'
import { useGameStore } from '@/stores'
import { usePopup } from '@/hooks'
import { randomInt } from '@/utils/math'

export const GameEventsVisualizer: React.FC = () => {
    const { gameInstance } = useGameStore();
    const { showPopup, popups } = usePopup();

    useEffect(() => {
        if (!gameInstance) return;

        const onScoreChange = (value: number, position?: {x: number, y: number}, difference?: number) => {
            if (!position || !difference) return;

            const [x, y] = Object.values(position).map(
                coordinate => `${
                    Math.round(coordinate * gameInstance.scale.zoom)
                }px`
            );

            const color = difference < 0 ? "rgb(255, 75, 75)" : '#f2d53b';
            const sign = difference < 0 ? '' : '+';  

            showPopup(
                sign + difference.toString(),
                700,
                {x, y},
                randomInt(-8, 8),
                Math.min(window.innerWidth * 20 / 318, window.innerHeight * 20 / 500),
                Math.min(window.innerWidth * 25 / 318, window.innerHeight * 25 / 500),
                color,
                color,
                color
            )
        }

        const onCharacterTookDamage = (position: {x: number, y: number}) => {
            const [x, y] = Object.values(position).map(
                coordinate => `${
                    Math.round(coordinate * gameInstance.scale.zoom)
                }px`
            );

            showPopup(
                'ой',
                700,
                {x, y},
                randomInt(-8, 8),
                Math.min(window.innerWidth * 20 / 318, window.innerHeight * 20 / 500),
                Math.min(window.innerWidth * 25 / 318, window.innerHeight * 25 / 500),
                "rgb(255, 75, 75)",
                "white",
                "rgb(255, 75, 75)"
            )
        }

        // const onComboReset = () => {
        //      showPopup(
        //         'Срос комбо',
        //         1000,
        //         { x: '50%', y: '20%' },
        //         randomInt(-10, 10),
        //         Math.min(window.innerWidth * 40 / 318, window.innerHeight * 40 / 500),
        //         Math.min(window.innerWidth * 32 / 318, window.innerHeight * 32 / 500),
        //         'red',
        //         'white',
        //         'red'
        //     );
        // }

        // const onMultipleKill = (multiplier: number, position: {x: number, y: number}) => {
        //     const [x, y] = Object.values(position).map(coordinate => `${Math.round(coordinate * gameInstance.scale.zoom)}px`);

        //     showPopup(
        //         `x${multiplier}`,
        //         500,
        //         {x, y},
        //         undefined,
        //         Math.min(window.innerWidth * 30 / 318, window.innerHeight * 30 / 500),
        //         Math.min(window.innerWidth * 40 / 318, window.innerHeight * 40 / 500),
        //         '#f2d53b',
        //         '#f2d53b',
        //         '#f2d53b'
        //     )
        // }



        // gameEvents.on('MULTIPLE_KILL', onMultipleKill);
        gameEvents.on('CHANGE_SCORE', onScoreChange)
        gameEvents.on('CHARACTER_TOOK_DAMAGE', onCharacterTookDamage)
        // gameEvents.on('COMBO_RESET', onComboReset)

        return () => {
            // gameEvents.off('MULTIPLE_KILL', onMultipleKill)
            gameEvents.off('CHANGE_SCORE', onScoreChange)
            gameEvents.off('CHARACTER_TOOK_DAMAGE', onCharacterTookDamage)
            // gameEvents.off('COMBO_RESET', onComboReset)
        }
    }, [gameInstance])

    return (
        <>
            {popups}
        </>
    )
}