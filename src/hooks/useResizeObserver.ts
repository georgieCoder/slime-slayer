import { useEffect } from 'react';

export const useResizeObserver = (callback: (entry: ResizeObserverEntry) => void, elementRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      callback(entries[0]);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [callback, elementRef]);
};