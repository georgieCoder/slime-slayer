import { BONUS, HeartBonusTexture, StarBonusTexture } from "@/game/entities/bonuses";
import { CHARACTER, CharacterTexture } from "@/game/entities/character";
import { SLIME, SlimeTexture } from "@/game/entities/slimes";

import redHeartFull from '@/game/assets/ui/hud/health_bar/red-heart-full.png';
import redHeartHalf from '@/game/assets/ui/hud/health_bar/red-heart-half.png';
import redHeartEmpty from '@/game/assets/ui/hud/health_bar/red-heart-empty.png';
import goldenHeartFull from '@/game/assets/ui/hud/health_bar/golden-heart-full.png';
import goldenHeartHalf from '@/game/assets/ui/hud/health_bar/golden-heart-half.png';
import goldenHeartEmpty from '@/game/assets/ui/hud/health_bar/golden-heart-empty.png';
import characterSpritesheet from '@/game/assets/spritesheets/character/spritesheet.png';
import heartBonusSpritesheet from '@/game/assets/spritesheets/bonuses/rotating_heart_spritesheet.png';
import starBonusSpritesheet from '@/game/assets/spritesheets/bonuses/rotating_star_spritesheet.png';
import jumpingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/jumping_slime_spritesheet.png';
import shootingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/shooting_slime_spritesheet.png';
import slimeProjectileSpritesheet from '@/game/assets/spritesheets/slimes/slime_projectile_spritesheet.png';
import hidingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/hiding_slime_spritesheet.png';
import hittingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/hitting_slime_spritesheet.png';
import slimeDuplicantSpritesheet from '@/game/assets/spritesheets/slimes/slime_duplicant_spritesheet.png';
import duplicatingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/duplicating_slime_spritesheet.png';
import sideMovingSlimeSpritesheet from '@/game/assets/spritesheets/slimes/side_moving_slime_spritesheet.png';
import backgroundImage from '@/game/assets/ui/background/background.png';
import particle1 from '@/game/assets/ui/particles/particle1.png';
import particle2 from '@/game/assets/ui/particles/particle2.png';
import particle3 from '@/game/assets/ui/particles/particle3.png';
import particle4 from '@/game/assets/ui/particles/particle4.png';
import particleSpritesheet from '@/game/assets/ui/particles/particle_spritesheet.png';


export interface IAssetLoader {
    readonly scene: Phaser.Scene;
    loadCharacterAssets(): this;
    loadHUDAssets(): this;
    loadBonusAssets(): this;
    loadSlimeAssets(): this;
    loadBackground(): this;
    loadParticleAssets(): this;
}

export class AssetLoader implements IAssetLoader {
    constructor(readonly scene: Phaser.Scene) {}

    loadParticleAssets(): this {
        this.scene.load.image('particle1', particle1)
        this.scene.load.image('particle2', particle2)
        this.scene.load.image('particle3', particle3)
        this.scene.load.image('particle4', particle4)
        this.scene.load.spritesheet('particles', particleSpritesheet, { frameWidth: 3, frameHeight: 3, endFrame: 3 })

        return this;
    }

    loadHUDAssets(): this {
        this.scene.load.image('red-heart-full', redHeartFull);
        this.scene.load.image('red-heart-half', redHeartHalf);
        this.scene.load.image('red-heart-empty', redHeartEmpty);
        this.scene.load.image('golden-heart-full', goldenHeartFull);
        this.scene.load.image('golden-heart-half', goldenHeartHalf);
        this.scene.load.image('golden-heart-empty', goldenHeartEmpty);
        return this;
    }

    loadCharacterAssets(): this {
        const frameConfig = {
            frameWidth: CHARACTER.FRAME_WIDTH,
            frameHeight: CHARACTER.FRAME_HEIGHT
        };

        this.scene.load.spritesheet(CharacterTexture, characterSpritesheet, frameConfig);
        return this;
    }

    loadBonusAssets(): this {
        const frameConfig = {
            frameWidth: BONUS.FRAME_WIDTH,
            frameHeight: BONUS.FRAME_HEIGHT
        }

        this.scene.load.spritesheet(HeartBonusTexture, heartBonusSpritesheet, frameConfig);
        this.scene.load.spritesheet(StarBonusTexture, starBonusSpritesheet, frameConfig);

        return this;
    }

    loadSlimeAssets(): this {
        const frameConfig = {
            frameWidth: SLIME.FRAME_WIDTH,
            frameHeight: SLIME.FRAME_HEIGHT
        }

        this.scene.load.spritesheet(SlimeTexture.JUMPING, jumpingSlimeSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.SHOOTING, shootingSlimeSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.PROJECTILE, slimeProjectileSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.HIDING, hidingSlimeSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.HITTING, hittingSlimeSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.DUPLICANT, slimeDuplicantSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.DUPLICATING, duplicatingSlimeSpritesheet, frameConfig);
        this.scene.load.spritesheet(SlimeTexture.SIDE_MOVING, sideMovingSlimeSpritesheet, frameConfig);

        return this;
    }

    loadBackground(): this {
        this.scene.load.image('background', backgroundImage);

        return this;
    }
}