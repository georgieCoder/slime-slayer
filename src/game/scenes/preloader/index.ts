import { gameEvents } from "@/GameEvents";
import { BonusAnimationManager, CharacterAnimationManager, SlimeAnimationManager } from "@/game/systems/animation";
import { AssetLoader, IAssetLoader } from "@/game/systems/assets";

export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'load' });
    }

    preload() {
        const assetLoader = new AssetLoader(this);

        assetLoader
            .loadCharacterAssets()
            .loadHUDAssets()
            .loadBonusAssets()
            .loadSlimeAssets()
            .loadBackground()
            .loadParticleAssets()

        this.load.on('progress', (value: number) => {
            gameEvents.emit("LOAD_PROGRESS", value);
        })
    }

    create() {
        CharacterAnimationManager.create(this);
        BonusAnimationManager.create(this);
        SlimeAnimationManager.create(this);
        this.scene.start('game')
    }
}