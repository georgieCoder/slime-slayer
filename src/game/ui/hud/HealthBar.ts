import { DEPTH_LAYERS } from "@/game/constants";
import { IGameScene } from "@/game/scenes/game";

export interface IHealthBar extends Phaser.GameObjects.Container  {
    isGolden: boolean;
    setHealth(value: number): void;
    setOffset(offsetX: number, offsetY: number): void;
    makeGolden(): void;
    makeRed(): void;
}

export class HealthBar extends Phaser.GameObjects.Container implements IHealthBar {
    private heartSpacing = 25;
    private healthForHeart = 2;
    private currentHealth: number;
    private hearts: Phaser.GameObjects.Image[];
    private visibleHearts: number;
    private offsetX = 0;
    private offsetY = 0;
    public maxHealth: number;
    public isGolden = false;

    constructor(
        scene: IGameScene,
        x: number,
        y: number,
        offsetX: number = 0,
        offsetY: number = 0,
        maxHealth: number = 5,
        isGolden: boolean = false
    ) {
        super(scene, x, y);
        scene.add.existing(this);

        this.currentHealth = maxHealth;
        this.maxHealth = Math.round(maxHealth);
        this.visibleHearts = Math.ceil(maxHealth / 2);
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isGolden = isGolden;
        this.hearts = [];

        this.createHearts();
        this.setDepth(DEPTH_LAYERS.ENTITIES.OVER);
    }

    private createHearts(): void {
        const totalWidth = (this.visibleHearts - 1) * this.heartSpacing;
        const startX = this.offsetX - totalWidth / 2;

        for (let i = 0; i < this.visibleHearts; i++) {
            const heartX = startX + i * this.heartSpacing;
            const texture = this.getHeartTexture(i);

            const heart = this.scene.add.image(heartX, this.offsetY, texture);
            this.add(heart);
            this.hearts.push(heart);
        }
    }

    private getHeartTexture(i: number): string {
        const heartType = this.isGolden ? 'golden' : 'red';
        const fullHeartsCount = Math.floor(this.currentHealth / this.healthForHeart);
        const halfHeartsCount = this.currentHealth % this.healthForHeart;

        const maxFullHeartIndex = fullHeartsCount - 1;
        const maxHalfHeartIndex = fullHeartsCount + halfHeartsCount - 1;

        return i <= maxFullHeartIndex
            ? `${heartType}-heart-full`
            : i <= maxHalfHeartIndex
            ? `${heartType}-heart-half`
            : `${heartType}-heart-empty`;
    }

    setHealth(value: number): void {
        const newHealth = Phaser.Math.Clamp(value, 0, this.maxHealth);

        const afterTweenCallback = () => {
            this.currentHealth = newHealth;
            this.updateHearts();
        };

        if (newHealth < this.currentHealth) {
            this.animateHearts(0.9, 0.8, 0xffffff, 30, afterTweenCallback);
        } else if (newHealth > this.currentHealth) {
            this.animateHearts(1.2, 1.2, 0xfca4a1, 30, afterTweenCallback);
        }
    }

    private animateHearts(
        scaleX: number,
        scaleY: number,
        tint: number,
        duration: number,
        callback: () => void
    ): void {
        this.hearts.forEach((heart, index) => {
            heart.setTintFill(tint);
            this.scene.tweens.add({
                targets: heart,
                scaleX: heart.scaleX * scaleX,
                scaleY: heart.scaleY * scaleY,
                duration: duration,
                yoyo: true,
                ease: 'Ease',
                onComplete: () => {
                    heart.clearTint();
                    heart.setScale(1)
                    if (index === this.hearts.length - 1) {
                        callback();
                    }
                }
            });
        });
    }

    private updateHearts(): void {
        for (let i = 0; i < this.visibleHearts; i++) {
            const texture = this.getHeartTexture(i);
            this.hearts[i].setTexture(texture);
        }
    }

    setOffset(offsetX: number, offsetY: number): void {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.updateHeartPositions();
    }

    private updateHeartPositions(): void {
        const totalWidth = (this.visibleHearts - 1) * this.heartSpacing;
        const startX = this.offsetX - totalWidth / 2;

        for (let i = 0; i < this.visibleHearts; i++) {
            this.hearts[i].setPosition(
                startX + i * this.heartSpacing,
                this.offsetY
            );
        }
    }

    makeGolden(): void {
        this.animateHearts(1.1, 1.1, 0xfef56b, 50, () => {
            this.isGolden = true;
            this.updateHearts();
        });
    }

    makeRed(): void {
        this.animateHearts(0.9, 1.2, 0xfca4a1, 50, () => {
            this.isGolden = false;
            this.updateHearts();
        });
    }

    destroy(): void {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];
        super.destroy();
    }
}