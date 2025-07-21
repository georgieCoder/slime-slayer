import { IGameScene } from "@/game/scenes/game";
import { ICharacter } from "@/game/entities/character";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SlimeTexture, SlimeType } from "./constants";
import { IEntityPool } from "@/game/systems/gameplay/spawner";
import { ISlimeProjectile, ISlimeProjectileParams, SlimeProjectile } from "./projectile";

export interface IShootingSlimeParams extends ISlimeParams {
    shootDelay: number,
    projectilePool?: IEntityPool<ISlimeProjectileParams, ISlimeProjectile>
}

export interface IShootingSlime extends ISlime<IShootingSlimeParams, SlimeType.SHOOTING> {}

export class ShootingSlime extends Slime<IShootingSlimeParams, SlimeType.SHOOTING> implements IShootingSlime {
    private _timer: Phaser.Time.TimerEvent | null = null;

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: IShootingSlimeParams
    ) {
        super(
            SlimeType.SHOOTING, 
            scene, 
            character, 
            SlimeTexture.SHOOTING, 
            params
        )
    }

    protected _startActing(): void {
        this.anims.play(this.animationKey.MOVE_DOWN);

        this._moveDown();

        this._timer = this.scene.time.delayedCall(this.params.shootDelay, () => {
            this._shoot()
        })
    }

    private _moveDown(): void {
        this.setVelocityY(this.params.speed);
    }

    private _stopMoving(): void {
        this.setVelocity(0)
    }

    private _shoot() {
        this._stopMoving();
        this.anims.play(this.animationKey.SHOOT);
        this.on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (frame.textureFrame === 10) {
                this._tryToActivateProjectile();
                this.off('animationupdate');
            }
        })
        this.once(`animationcomplete-${this.animationKey.SHOOT}`, () => {
            this.die();
        })
    }

    private _createProjectileParams(): ISlimeProjectileParams {
        return { 
            speed: this.params.speed + Phaser.Math.Between(30, 60),
            x: this.x,
            y: this.y
        }
    }

    private _activateProjectile(projectile: ISlimeProjectile, params: ISlimeProjectileParams): void {
        projectile.reset(params);
        projectile.activate();
    }

    private _tryToActivateProjectile(): void {
        const { projectilePool } = this.params;

        const projectileParams = this._createProjectileParams();
        const firstDeactivatedProjectile = projectilePool?.get();

        if (firstDeactivatedProjectile) {
            this._activateProjectile(firstDeactivatedProjectile, projectileParams);
        } else {
            this._createProjectile(projectileParams)
        }
    }

    private _createProjectile(params: ISlimeProjectileParams): void {
        console.warn('Будет создан новый снаряд стреляющего слайма вместо взятия из пула')
        const projectile = new SlimeProjectile(
            this.scene, 
            this.character, 
            params
        )
        projectile.activate()
        projectile.onDeactivate(() => {
            projectile.safeDestroy()
        })
    }

    protected _stopActing(): void {
        this._timer?.destroy()
        this._timer = null;
        this._stopMoving();
    }

    protected _onDeath(): void {
        super._onDeath();
        this._stopMoving();
        this.anims.play(this.animationKey.DIE);
        this.once(`animationcomplete-${this.animationKey.DIE}`, () => {
            this.deactivate()
        });
    }
}