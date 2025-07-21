import './style.css';

export const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="panel-container overlay">
            <div className="panel icon">
                <div className="panel_content">
                    {children}
                </div>
            </div>
        </div>
    )
}