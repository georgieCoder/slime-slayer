import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeTexture, SlimeType } from "./constants";
import { ICharacter } from "@/game/entities/character";
import { WORLD } from "@/game/constants";

export interface ISideMovingSlimeParams extends ISlimeParams {
    sideMovingDelay: {
        min: number,
        max: number
    },
    sideMovingDuration: {
        min: number,
        max: number
    }
}

export interface ISideMovingSlime extends ISlime<ISideMovingSlimeParams, SlimeType.SIDE_MOVING> {}

export class SideMovingSlime extends Slime<ISideMovingSlimeParams, SlimeType.SIDE_MOVING> implements ISideMovingSlime {
    private _timer: Phaser.Time.TimerEvent | null = null;
    private _currentDirection: 'left' | 'right' | 'down' = 'down'; 

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: ISideMovingSlimeParams
    ) {
        super(
            SlimeType.SIDE_MOVING,
            scene,
            character,
            SlimeTexture.SIDE_MOVING,
            params
        )

        this.setupCollider(SLIME.BODY_WIDTH, SLIME.BODY_HEIGHT, false, true);

        this.setCollideWorldBounds(true);
    }

    private _stopMovement(): void {
        this.setVelocity(0)
        this._timer?.destroy();
        this._timer = null;
    }

    private _moveDown(): void {
        this._stopMovement();
        this._currentDirection = 'down';
        this.flipX = false;
        const { min, max} = this.params.sideMovingDelay;

        this.anims.play(this.animationKey.MOVE_DOWN);
        this.setVelocityY(this.params.speed);

        this._sheduleSidewaysMovement(Phaser.Math.Between(min, max))
    }

    private readonly paddingX = 50;

    private _sheduleSidewaysMovement(delay: number): void {
        this._timer?.destroy();
        this._timer = this.scene.time.delayedCall(delay, () => {
            const shouldMoveRight = this.x <= WORLD.WIDTH - this.paddingX;
            const shouldMoveLeft = this.x >= this.paddingX; 

            const targetDirection = shouldMoveRight && !shouldMoveLeft
                                    ? 'right'
                                    : shouldMoveLeft && !shouldMoveRight
                                    ? 'left'
                                    : ['right', 'left'][Phaser.Math.Between(0, 1)] as 'right' | 'left';

            this._moveSideways(targetDirection);
        })
    }

    private _sheduleDownwardMovement(delay: number): void {
        this._timer?.destroy();
        this._timer = this.scene.time.delayedCall(delay, () => {
            this._moveDown();
        })
    }

    private _moveSideways(direction: 'right' | 'left'): void {
        this._stopMovement();

        const { min, max } = this.params.sideMovingDuration;
        const { speed } = this.params;

        this._currentDirection = direction;

        this.anims.play(this.animationKey.MOVE_RIGHT);
        this.setVelocityX(direction === 'left' ? -speed : speed);
        this.flipX = direction === 'left';

        this._sheduleDownwardMovement(Phaser.Math.Between(min, max))
    }

    protected _startActing(): void {
        this._moveDown()
    }

    protected _stopActing(): void {
        this.anims.stop();
        this._stopMovement();
        this.off(`animationcomplete-${this.animationKey.DIE}`);
    }

    protected _onDeath(): void {
        super._onDeath();
        this._stopMovement();

        this.anims.play(this.animationKey.DIE);
        this.flipX = false;
        
        this.once(`animationcomplete-${this.animationKey.DIE}`, () => {
            this.deactivate()
        });
    }

    reset(params: ISideMovingSlimeParams): void {
        super.reset(params);
        this.flipX = false;
        this._currentDirection = 'down';
    }

    protected onUpdate(): void {
        super.onUpdate();

        if (this.body && (this.body.blocked.right || this.body.blocked.left)) {
            this._timer?.destroy();
            this._timer = null;
            this._moveDown();
        }
    }
}