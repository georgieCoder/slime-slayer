import { ModalContent } from "./ModalContent"

export const Version054Post: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <ModalContent title="v0.5.4" onBack={onBack}>
            <>
                <p>В новой версии мы добавили:</p>
                <ul>
                    <li>Новые виды слаймов с уникальными способностями</li>
                    <li>Систему прокачки персонажа</li>
                    <li>Дополнительные уровни сложности</li>
                </ul>
                <p>Также исправлены основные баги предыдущей версии и улучшена производительность.</p>
            </>
        </ModalContent>
    )
}