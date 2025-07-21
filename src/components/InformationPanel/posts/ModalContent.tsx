import { ReactNode } from 'react'

interface IModalContentProps {
    title: string;
    children: ReactNode;
    onBack: () => void;
}

export const ModalContent = ({ title, children, onBack }: IModalContentProps) => {
    return (
        <div className="modal-content">
            <button onClick={onBack} className="modal-back-btn">
                <svg className="image svg_clickable svg_clickable__dark" viewBox="0 0 512 512"><path d="M320 149.5V192H21v128h299v85h43v-42h42v-43h43v-43h43v-42h-43v-43h-43v-43h-42v-42h-43v42.5z"/></svg>
            </button>
            <h2 className="modal-title">{title}</h2>
            <div className="modal-body">
                {children}
            </div>
        </div>
    )
}