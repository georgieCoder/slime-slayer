import './style.css'
import { useRef, useState } from 'react'
import { CustomScrollbar } from './CustomScrollbar';
import { CreditsPost, HelloPost, Version054Post } from './posts';

interface IInformationPanelProps {
    visible: boolean, 
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

enum Post {
    hello,
    version054,
    credits
}

const postComponents = {
    [Post.hello]: HelloPost,
    [Post.version054]: Version054Post,
    [Post.credits]: CreditsPost
};

const menuItems = [
    { id: Post.hello, title: "Привет!" },
    { id: Post.version054, title: "v0.5.4" },
    { id: Post.credits, title: "Credits" }
];

export const InformationPanel: React.FC<IInformationPanelProps> = ({ visible, setVisible }) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const [currentPost, setCurrentPost] = useState<Post | null>(null)

    if (!visible) return null

    return (
        <div className="information-panel icon">
            <div className="information-panel_inner">
                <div className="information-panel_header icon"></div>
                <CustomScrollbar contentRef={contentRef} />
                <button onClick={() => setVisible(false)} className="information-panel_close-btn close-btn icon"></button>
                <div className="information-panel_inner-container">
                    <div 
                        ref={contentRef} 
                        className="information-panel_content"
                    >
                        {
                        currentPost === null 
                        ? 
                            (
                                <div className="menu-items">
                                    {menuItems.map((item) => (
                                        <h2 
                                            key={item.id}
                                            className="menu-item"
                                            onClick={() => {setCurrentPost(item.id); if (contentRef.current) {
                                            console.log('set 0 scroll')
                                            contentRef.current.scrollTop = 0
                                        }}}
                                        >
                                            {item.title}
                                        </h2>
                                    ))}
                                </div>
                            ) 
                            : 
                            (
                                (() => {
                                    const PostComponent = postComponents[currentPost];
                                    return <PostComponent onBack={() => { 
                                        setCurrentPost(null);
                                        if (contentRef.current) {
                                            console.log('set 0 scroll')
                                            contentRef.current.scrollTop = 0
                                        }
                                    }} />;
                                })()
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}