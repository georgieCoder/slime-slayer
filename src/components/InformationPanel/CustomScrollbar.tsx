import { useCallback, useEffect, useRef, useState } from 'react'

interface ICustomScrollbarProps {
    contentRef: React.RefObject<HTMLDivElement | null>;
}

export const CustomScrollbar = ({ contentRef }: ICustomScrollbarProps) => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const sliderContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [sliderTop, setSliderTop] = useState(0)
    const canScroll = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        setStartY(e.clientY - (sliderRef.current?.getBoundingClientRect().top || 0))
    }

    const updateScrollbar = () => {
        if (!contentRef.current || !sliderContainerRef.current || !sliderRef.current || !canScroll.current) return
        
        const content = contentRef.current
        const container = sliderContainerRef.current
        const maxTop = container.clientHeight - sliderRef.current.clientHeight
        
        const scrollRatio = content.scrollTop / (content.scrollHeight - content.clientHeight)
        const newTop = scrollRatio * maxTop || 0
        setSliderTop(newTop)
        if (sliderRef.current) sliderRef.current.style.top = `${newTop}px`
    }

    useEffect(() => {
        updateScrollbar()
    }, [contentRef.current?.scrollTop])

    useEffect(() => {
        if (contentRef.current === null || sliderContainerRef.current === null) return;
        console.log(contentRef.current.scrollHeight, sliderContainerRef.current.clientHeight)
        canScroll.current = contentRef.current.scrollHeight > sliderContainerRef.current.clientHeight
    }, [contentRef.current?.scrollHeight, sliderContainerRef.current?.clientHeight])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !sliderRef.current || !sliderContainerRef.current || !contentRef.current) return;
            
            const container = sliderContainerRef.current
            const content = contentRef.current
            
            let newTop = e.clientY - container.getBoundingClientRect().top - startY
            const maxTop = container.clientHeight - sliderRef.current.clientHeight
            newTop = Math.max(0, Math.min(newTop, maxTop))
            
            if (sliderRef.current) sliderRef.current.style.top = `${newTop}px`
            
            const scrollRatio = newTop / maxTop
            content.scrollTop = scrollRatio * (content.scrollHeight - content.clientHeight)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging && canScroll.current) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, startY, contentRef, canScroll])

    useEffect(() => {
        console.log('subscribe to scoll', canScroll.current, contentRef.current)
        canScroll.current && contentRef.current?.addEventListener('scroll', updateScrollbar)
        return () => {
            console.log('unsubscribe to scroll')
            contentRef.current?.removeEventListener('scroll', updateScrollbar)
        }
    }, [contentRef, canScroll])

    return (
        <div ref={sliderContainerRef} className="information-panel_slider-container">
            <div 
                ref={sliderRef}
                className="information-panel_slider slider image"
                onMouseDown={handleMouseDown}
                style={{ top: `${sliderTop}px` }}
            />
        </div>
    )
}