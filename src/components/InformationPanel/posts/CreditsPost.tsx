import { ModalContent } from "./ModalContent"

export const CreditsPost: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <ModalContent title="Credits" onBack={onBack}>
            <>
                <ul>
                    <li>Программирование - @ropasopa</li>
                    <li>Анимация - <a href="https://vk.com/piskamiskasosiska" target='_blank'>https://vk.com/piskamiskasosiska</a></li>
                    <li>Визуал - <a href="https://vk.com/club173775696" target='_blank'>https://vk.com/club173775696</a></li>
                </ul>
                <p style={{marginTop: '6%'}}>(комментарий программиста)</p> 
                <p>расширение лучше открывать в новой вкладке - интерфейс адаптивный и растянется на всю высоту страницы</p>
            </>
        </ModalContent>
    )
}