import { IGameScene } from "@/game/scenes/game";
import { CharacterStateType, ICharacter } from "@/game/entities/character";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeAnimationKey, SlimeTexture, SlimeType } from "./constants";

export interface IJumpingSlimeParams extends ISlimeParams {
    jumpDelay: number
}

export interface IJumpingSlime extends ISlime<IJumpingSlimeParams, SlimeType.JUMPING> {}

export class JumpingSlime extends Slime<IJumpingSlimeParams, SlimeType.JUMPING> implements IJumpingSlime {
    private _jumpTimer: Phaser.Time.TimerEvent | null = null;
    private _tween: Phaser.Tweens.Tween | null = null;

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: IJumpingSlimeParams
    ) {
        super(
            SlimeType.JUMPING, 
            scene, 
            character, 
            SlimeTexture.JUMPING, 
            params
        );

        this.setDragY(300);

        // слайм плохо выровнен на спрайтшите, поэтому приходится дополнитльно смещать коллайдер
        this.body && this.setOffset(this.body.offset.x, this.body.offset.y + 12);
    }

    protected _startActing(): void {
        this._startJumping();
    }

    protected _stopActing(): void {
        this._tween?.destroy();
        this._tween = null;
        this._stopJumping();
    }

    private _startJumping(): void {
        this._doJump();
        this._stopJumping();
        this._jumpTimer = this.scene.time.delayedCall(
            this.params.jumpDelay,
            () => {
                this._startJumping()
            }
        )
    }

    private _stopJumping(): void {
        this.setScale(SLIME.SCALE);
        this._jumpTimer?.destroy();
        this._jumpTimer = null;
    }

    private _doJump(): void {
        this.setVelocityY(this.params.speed);
        this.anims.play(this.animationKey.MOVE_DOWN);

        this._tween = this.scene.tweens.add({
            targets: this,
            scaleX: SLIME.SCALE - 0.1,
            scaleY: SLIME.SCALE + 0.2,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        this.setBlendMode(Phaser.BlendModes.NORMAL)
        this.once(`animationcomplete-${this.animationKey.MOVE_DOWN}`, () => {
            this.anims.play(this.animationKey.IDLE);
        });
    }

    protected _onDeath(): void {
        super._onDeath();;
        this.setVelocity(0);
        this.anims.play(this.animationKey.DIE);
        this.once(`animationcomplete-${this.animationKey.DIE}`, () => {
            this.deactivate()
        });
    }
}