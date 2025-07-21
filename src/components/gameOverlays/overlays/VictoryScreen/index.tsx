import './style.css'

export const VictoryScreen: React.FC = () => {
    return (
        <div className="victory-screen overlay">
            <div className="victory-screen_content">
                <div className="victory-screen_text icon"></div>
                <div className="victory-screen_slime icon"></div>
                <p className="victory-screen_hint hint">Нажми ЛКМ или R, чтобы начать сначала</p>
            </div>
        </div>
    )
}