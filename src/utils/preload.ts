const preloader = document.getElementById('preloader');

export function preloadResources(urls: string[], as: 'image'): Promise<void[]> {
    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = as;
          link.href = url;
          
          link.onload = () => resolve();
          
          document.head.appendChild(link);
        });
      })
    );

}