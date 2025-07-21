import { preloadResources } from "@/utils/preload";

import '@/styles/global.css';
import '@/styles/preloader.css';

import mainBackground from '@/assets/main_screen/webp/background.webp';
import loaderBackground from '@/assets/loader/background.png';

document.addEventListener('DOMContentLoaded', async () => { 
    const preloader = document.getElementById('preloader');

    await preloadResources(
        [ mainBackground, loaderBackground ],
        'image'
    );
    
    await import('./main');

    if (preloader) {
        preloader.style.display = 'none';
    }
});