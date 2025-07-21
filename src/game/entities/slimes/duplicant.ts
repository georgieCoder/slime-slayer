import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeTexture, SlimeType } from "./constants";
import { ICharacter } from "@/game/entities/character";

export interface ISlimeDuplicantParams extends ISlimeParams {
    /**
     * @property
     * Начальное направление движение и продолжительность такого движения, после которого слайм начнет двигаться только вниз
     */
    initialMovement: { 
        direction: 'right'| 'left' | 'down', 
        duration?: number 
    }
}

export interface ISlimeDuplicant extends ISlime<ISlimeDuplicantParams, SlimeType.DUPLICANT> {}

export class SlimeDuplicant extends Slime<ISlimeDuplicantParams, SlimeType.DUPLICANT> implements ISlimeDuplicant {
    private _timer: Phaser.Time.TimerEvent | null = null;

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: ISlimeDuplicantParams
    ) {
        super(
            SlimeType.DUPLICANT,
            scene,
            character,
            SlimeTexture.DUPLICANT,
            params
        )

        this.setupCollider(SLIME.DUPLICANT_BODY_WIDTH, SLIME.DUPLIACNT_BODY_HEIGHT, false, true);
        this.setCollideWorldBounds(true);
    }

    private _sheduleDownwardMovement(delay: number): void {
        this._timer = this.scene.time.delayedCall(delay, () => {
            this._moveDown();
        })
    }

    private _moveSideways(direction: 'right' | 'left', duration: number | undefined): void {
        this._stopMovement();
        const speed = this.params.speed;

        this.anims.play(this.animationKey.MOVE_RIGHT);

        this.setVelocityX(direction === 'left' ? -speed : speed);
        this.flipX = direction === 'left';

        duration !== undefined && this._sheduleDownwardMovement(duration);
    }

    private _moveDown(): void {
        const animationToPlay = this.params.initialMovement.direction === 'right' 
                                ? this.animationKey.RIGHT_MOVE_DOWN 
                                : this.animationKey.LEFT_MOVE_DOWN


        this.flipX = false;
        this._stopMovement()
        this.setVelocityY(this.params.speed)
        this.anims.play(animationToPlay)
    }

    private _stopMovement(): void {
        this.setVelocity(0)
        this._timer?.destroy();
        this._timer = null;
    }

    private _startMoving(): void {
        const { direction, duration } = this.params.initialMovement;

        if ( direction !== 'down') {
            this._moveSideways(direction, duration);
        } else {
            this._moveDown();
        }
    }

    protected _startActing(): void {
        this._startMoving();
    }

    protected _stopActing(): void {
        this.anims.stop();
        this._stopMovement();
        this.off(`animationcomplete-${this.animationKey.RIGHT_DIE}`);
        this.off(`animationcomplete-${this.animationKey.LEFT_DIE}`);
    }

    reset(params: ISlimeDuplicantParams): void {
        super.reset(params)
        this.flipX = false;
    }

    protected _onDeath(): void {
        super._onDeath();
        this._stopMovement();

        const animationToPlay = this.params.initialMovement.direction === 'right' 
                        ? this.animationKey.RIGHT_DIE
                        : this.animationKey.LEFT_DIE

        this.anims.play(animationToPlay);

        this.once(`animationcomplete-${animationToPlay}`, () => {
            this.deactivate()
        });
    }

    protected onUpdate(): void {
        super.onUpdate();

        if (this.body && (this.body.blocked.right || this.body.blocked.left) && !this.isDead) {
            this._timer?.destroy();
            this._timer = null;
            this._moveDown();
        }
    }
}