export class ParticleSystem {
    private emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createEmitter(config: {
        width: number;
        position?: { x: number; y: number };
        depth?: number;
        speedY?: { min: number; max: number };
        speedX?: { min: number; max: number };
        tint?: number[];
    }): void {
        if (this.emitter) {
            this.emitter.stop();
            this.emitter.destroy();
        }

        this.emitter = this.scene.add.particles(0, 0, 'particles', {
            lifespan: 2500,
            speedY: config.speedY || { min: 190, max: 250 },
            speedX: config.speedX || { min: -30, max: 30 },
            scale: { start: 3, end: 0 },
            rotate: { start: 0, end: 360 },
            blendMode: 'NORMAL',
            tint: config.tint || [0xFF5733, 0x33FF57, 0x3357FF, 0xF3FF33, 0xFF33F3],
            tintFill: true,
            frequency: 20,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, 0, config.width, 1),
                quantity: 1
            },
            frame: {
                frames: [ 0, 1, 2, 3 ],
                cycle: true,
                quantity: 1
            }
        });

        this.emitter.setPosition(
            config.position?.x || 0, 
            config.position?.y || 0
        );

        if (config.depth !== undefined) {
            this.emitter.setDepth(config.depth);
        }
    }

    public start(): void {
        this.emitter?.start();
    }

    public stop(): void {
        this.emitter?.stop();
    }

    public setVisible(visible: boolean): void {
        this.emitter?.setVisible(visible);
    }

    public destroy(): void {
        this.emitter?.stop();
        this.emitter?.destroy();
    }
}