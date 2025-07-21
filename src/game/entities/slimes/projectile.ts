import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeTexture, SlimeType } from "./constants";
import { CharacterStateType, ICharacter } from "../character";
import { DEPTH_LAYERS } from "@/game/constants";

export interface ISlimeProjectileParams extends ISlimeParams {
    behaior?: 'aim' | 'forward' 
}

export interface ISlimeProjectile extends ISlime<ISlimeProjectileParams, SlimeType.PROJECTILE> {}

export class SlimeProjectile extends Slime<ISlimeProjectileParams, SlimeType.PROJECTILE> implements ISlimeProjectile {
    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: ISlimeProjectileParams
    ) {
        super(
            SlimeType.PROJECTILE,
            scene,
            character,
            SlimeTexture.PROJECTILE,
            params,
            { 
                vulnerableCharacterStates: [ 
                    CharacterStateType.IDLE, 
                    CharacterStateType.WALK, 
                    CharacterStateType.ATTACK 
                ] 
            }
        )

        this.setupCollider(SLIME.PROJECTILE_BODY_WIDTH, SLIME.PROJECTILE_BODY_HEIGHT, true);
        this.setDepth(DEPTH_LAYERS.ENTITIES.SLIME.OVER);
        this.setCollideWorldBounds(false)
    }

    protected _startActing(): void {
        this.setVelocityY(this.params.speed);
        this.anims.play(this.animationKey.FLY);

        if (!this.params.behaior) {
            [() => this._rotateForward(), () => this._rotateTowardsPlayer()][Phaser.Math.Between(0, 1)]()
            return;
        } else {
            switch (this.params.behaior) {
                case "aim":
                    this._rotateTowardsPlayer()
                    break;
                case "forward":
                    this._rotateForward()
                    break;
            }
        }
    }

    private _rotateForward(): void {
        this.setRotation(-Math.PI / 2);
    }

    private _rotateTowardsPlayer(): void {
        const angleBetweenCharacter = Phaser.Math.Angle.Between(this.x, this.y, this.character.x, this.character.y);

        this.setRotation(angleBetweenCharacter - Math.PI);

        if (this.body) {
            this.body.velocity.setAngle(angleBetweenCharacter)
        }
    }

    protected _stopActing(): void {
        this.setVelocity(0);
    }

    protected _onDeath(): void {
        super._onDeath()
        this.deactivate()
    }

    protected onUpdate(): void {
        if ( this.checkOutOfBounds( { bottom: true, left: true, right: true } ) ) this.deactivate();
    }
}