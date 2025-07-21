import { ReactNode } from 'react'

interface IModalContentProps {
    title: string;
    children: ReactNode;
    onBack: () => void;
}

export const ModalContent = ({ title, children, onBack }: IModalContentProps) => {
    return (
        <div className="modal-content">
            <button onClick={onBack} className="modal-back-btn">←</button>
            <h2 className="modal-title">{title}</h2>
            <div className="modal-body">
                {children}
            </div>
        </div>
    )
}