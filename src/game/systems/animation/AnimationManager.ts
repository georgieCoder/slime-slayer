import { HeartBonusTexture, RotateHeartAnimationKey, RotateStarAnimationKey, StarBonusTexture } from "@/game/entities/bonuses";
import { CharacterAnimationKey, CharacterTexture } from "@/game/entities/character";
import { SlimeAnimationKey, SlimeTexture, SlimeType } from "@/game/entities/slimes";

interface AnimationConfig {
    key: string;
    texture: string;
    start: number;
    end: number;
    frameRate: number;
    repeat: number;
    yoyo?: boolean;
}

type AnimationTarget = Phaser.Scene | Phaser.GameObjects.GameObject & { anims: Phaser.Animations.AnimationState };

class AnimationManager {
    static createAnimationFromConfig(object: AnimationTarget, animationConfig: AnimationConfig): void {
        object.anims.create({
            key: animationConfig.key,
            frames: object.anims.generateFrameNumbers(animationConfig.texture, {
                start: animationConfig.start,
                end: animationConfig.end
            }),
            frameRate: animationConfig.frameRate,
            repeat: animationConfig.repeat,
            yoyo: animationConfig?.yoyo,
        });
    }
}

export class CharacterAnimationManager extends AnimationManager {
    private static readonly ANIMATION_CONFIGS: readonly AnimationConfig[] = [
        { key: CharacterAnimationKey.IDLE, texture: CharacterTexture, start: 8, end: 15, frameRate: 10, repeat: -1 },
        { key: CharacterAnimationKey.WALK_RIGHT, texture: CharacterTexture, start: 24, end: 27, frameRate: 15, repeat: -1 },
        { key: CharacterAnimationKey.DASH_RIGHT, texture: CharacterTexture, start: 32, end: 34, frameRate: 20, repeat: 0 },
        { key: CharacterAnimationKey.DASH_UP, texture: CharacterTexture, start: 16, end: 20, frameRate: 15, repeat: 0 },
        { key: CharacterAnimationKey.DIE, texture: CharacterTexture, start: 0, end: 5, frameRate: 10, repeat: 0 }
    ];

    static create(scene: Phaser.Scene): void {
        this.ANIMATION_CONFIGS.forEach(config => {
            this.createAnimationFromConfig(scene, config);
        });
        
    }
}

export class BonusAnimationManager extends AnimationManager {
    private static readonly ANIMATION_CONFIGS: AnimationConfig[] = [
        { key: RotateHeartAnimationKey, texture: HeartBonusTexture, start: 0, end: 7, frameRate: 10, repeat: -1},
        { key: RotateStarAnimationKey, texture: StarBonusTexture, start: 0, end: 7, frameRate: 10, repeat: -1},
    ]

    static create(scene: Phaser.Scene): void {
        this.ANIMATION_CONFIGS.forEach(config => {
            this.createAnimationFromConfig(scene, config)
        })
    }
}

export class SlimeAnimationManager extends AnimationManager {
    private static readonly ANIMATION_CONFIGS: AnimationConfig[] = [
        { key: SlimeAnimationKey[SlimeType.JUMPING].MOVE_DOWN, texture: SlimeTexture.JUMPING, start: 0, end: 7, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.JUMPING].IDLE, texture: SlimeTexture.JUMPING, start: 0, end: 15, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.JUMPING].DIE, texture: SlimeTexture.JUMPING, start: 16, end: 20, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.SHOOTING].MOVE_DOWN, texture: SlimeTexture.SHOOTING, start: 32, end: 35, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.SHOOTING].SHOOT, texture: SlimeTexture.SHOOTING, start: 0, end: 15, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.SHOOTING].DIE, texture: SlimeTexture.SHOOTING, start: 16, end: 20, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.PROJECTILE].FLY, texture: SlimeTexture.PROJECTILE, start: 0, end: 7, frameRate: 15, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.HIDING].HIDE, texture: SlimeTexture.HIDING, start: 0, end: 12, frameRate: 20, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.HIDING].MOVE_DOWN_NORMALLY, texture: SlimeTexture.HIDING, start: 26, end: 29, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.HIDING].MOVE_DOWN_HIDING, texture: SlimeTexture.HIDING, start: 39, end: 42, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.HIDING].DIE, texture: SlimeTexture.HIDING, start: 13, end: 16, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.HITTING].MOVE_DOWN, texture: SlimeTexture.HITTING, start: 12, end: 15, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.HITTING].HIT, texture: SlimeTexture.HITTING, start: 0, end: 11, frameRate: 15, repeat: 0, yoyo: true},
        { key: SlimeAnimationKey[SlimeType.HITTING].DIE, texture: SlimeTexture.HITTING, start: 24, end: 28, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.SIDE_MOVING].MOVE_DOWN, texture: SlimeTexture.SIDE_MOVING, start: 0, end: 3, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.SIDE_MOVING].MOVE_RIGHT, texture: SlimeTexture.SIDE_MOVING, start: 4, end: 7, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.SIDE_MOVING].DIE, texture: SlimeTexture.SIDE_MOVING, start: 8, end: 11, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.DUPLICATING].MOVE_DOWN, texture: SlimeTexture.DUPLICATING, start: 9, end: 12, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.DUPLICATING].DUPLICATE, texture: SlimeTexture.DUPLICATING, start: 0, end: 8, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.DUPLICANT].LEFT_DIE, texture: SlimeTexture.DUPLICANT, start: 0, end: 3, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.DUPLICANT].LEFT_MOVE_DOWN, texture: SlimeTexture.DUPLICANT, start: 8, end: 11, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.DUPLICANT].RIGHT_DIE, texture: SlimeTexture.DUPLICANT, start: 4, end: 7, frameRate: 10, repeat: 0},
        { key: SlimeAnimationKey[SlimeType.DUPLICANT].RIGHT_MOVE_DOWN, texture: SlimeTexture.DUPLICANT, start: 12, end: 15, frameRate: 10, repeat: -1},
        { key: SlimeAnimationKey[SlimeType.DUPLICANT].MOVE_RIGHT, texture: SlimeTexture.DUPLICANT, start: 16, end: 19, frameRate: 10, repeat: -1},
    ]

    static create(scene: Phaser.Scene): void {
        this.ANIMATION_CONFIGS.forEach(config => {
            this.createAnimationFromConfig(scene, config)
        })
    }
}