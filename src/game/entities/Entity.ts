import { IGameScene } from "@/game/scenes/game";
import { GameState } from "@/game/systems/state";

export interface IEntity extends Phaser.Physics.Arcade.Sprite {
    readonly scene: IGameScene;
    pauseUpdates(): void;
    resumeUpdates(): void;
    safeDestroy(): void;
}

/**
 * Базовый класс сущностей с поддержкой безопасного уничтожения с очисткой ресурсов
 * и безопасного обновления, чтобы сущность не обновлялась, когда не должна
 *  
 */
export abstract class Entity extends Phaser.Physics.Arcade.Sprite implements IEntity {
    protected _isDestroyed: boolean = false;
    protected _cleanupCallbacks: (() => void)[] = [];
    protected _updateActive: boolean = true;

    constructor(
        readonly scene: IGameScene, 
        x: number, 
        y: number, 
        texture: string, 
    ) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        scene.events.on(Phaser.Scenes.Events.UPDATE, this._onUpdate, this);
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this._onPostUpdate, this);

        this.addCleanupCallback(() => {
            scene.events.off(Phaser.Scenes.Events.UPDATE, this._onUpdate, this);
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this._onPostUpdate, this);
        });
    }

    safeDestroy(): void {
        if (this._isDestroyed) return;

        this._isDestroyed = true;
        this._updateActive = false;
        this._cleanupResources();

        if (this.body) {
            this.body.enable = false;
        }

        this.destroy();
    }

    pauseUpdates(): void {
        this._updateActive = false;
    }

    resumeUpdates(): void {
        this._updateActive = true;
    }

    protected addCleanupCallback(callback: () => void): void {
        this._cleanupCallbacks.push(callback);
    }

    private _cleanupResources(): void {
        this._cleanupCallbacks.forEach(cb => cb());
        this._cleanupCallbacks = [];
    }

    private _shouldUpdate(): boolean {
        // почему-то typescript думает, что тип результата проверки boolean | undefined,
        // поэтому привожу все к типу boolean
        return Boolean(
            !this._isDestroyed && 
            this.active && 
            this.scene &&
            this.body?.enable && 
            this._updateActive && 
            this.scene.currentState !== GameState.PAUSED
        );
    }

    private _onUpdate(time: number, delta: number): void {
        if (!this._shouldUpdate()) return;
        
        try {
            this.onUpdate(time, delta);
        } catch (e) {
            console.error('Error in entity update:', e);
            this.safeDestroy();
        }
    }

    private _onPostUpdate(time: number, delta: number): void {
        if (!this._shouldUpdate()) return;
        
        try {
            this.onPostUpdate(time, delta);
        } catch (e) {
            console.error('Error in entity postUpdate:', e);
            this.safeDestroy();
        }
    }

    protected onUpdate(time: number, delta: number): void {}
    protected onPostUpdate(time: number, delta: number): void {}
}