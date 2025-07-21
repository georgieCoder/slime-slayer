import { WORLD } from '@/game/constants';
import { GameScene } from '@/game/scenes/game';
import { PreloaderScene } from '@/game/scenes/preloader';


(async function(){
  const currentScriptElement = document.currentScript as HTMLScriptElement;
  const src = currentScriptElement.src;
  const scriptContent = await fetch(src).then(res => res.text());

  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(scriptContent)
  )

  const hexHash = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

  console.log(hexHash)
})()

export const initGame = () => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: WORLD.WIDTH,
    height: WORLD.HEIGHT,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // phaser по умолчанию оборачивает все xhr запросы в :blob, что может нарушать политику безопасности твича
    // заставляю его использовать абсолютные пути при доступе к картинкам
    loader: {
      imageLoadType: 'HTMLImageElement'
    },
    scene: [PreloaderScene, GameScene],
    pixelArt: true,
    physics: { 
      default: 'arcade', 
      arcade: {
        gravity: { y: 0, x: 0 },
        debug: false
      } 
    }
  };
  return new Phaser.Game(config);
};
