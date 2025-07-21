import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeTexture, SlimeType } from "./constants";
import { ICharacter } from "@/game/entities/character";
import { IEntityPool } from "@/game/systems/gameplay/spawner";
import { ISlimeDuplicant, ISlimeDuplicantParams, SlimeDuplicant } from "./duplicant";

export interface IDuplicatingSlimeParams extends ISlimeParams {
    duplicationDelay: number,
    duplicantPool: IEntityPool<ISlimeDuplicantParams, ISlimeDuplicant>
}

export interface IDuplicatingSlime extends ISlime<IDuplicatingSlimeParams, SlimeType.DUPLICATING> {}

export class DuplicatingSlime extends Slime<IDuplicatingSlimeParams, SlimeType.DUPLICATING> implements IDuplicatingSlime {
    private _timer: Phaser.Time.TimerEvent | null = null;

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: IDuplicatingSlimeParams
    ) {
        super(
            SlimeType.DUPLICATING,
            scene,
            character,
            SlimeTexture.DUPLICATING,
            params,
            { vulnerableCharacterStates: [] }
        )

        this.setupCollider(SLIME.BODY_WIDTH, SLIME.BODY_HEIGHT, false, true);

        // для этого слайма не предусмотрена анимация смерти, поэтому он бессмертен, да
        this.setImmortality(true);
        this.disableCollisions();
    }

    private _stopMoving(): void {
        this.setVelocity(0);
    }

    private _moveDown(): void {
        this.anims.play(this.animationKey.MOVE_DOWN)
        this.setVelocityY(this.params.speed);
    }

    private _createDuplicantParams(direction: 'right' | 'left', offsetX: number, offsetY: number): ISlimeDuplicantParams {
        return {
            initialMovement: {
                direction,
                duration: Phaser.Math.Between(500, 800)
            },
            x: this.x + offsetX * SLIME.SCALE,
            y: this.y + offsetY * SLIME.SCALE,
            speed: this.params.speed + Phaser.Math.Between(-80, -30)
        }
    }

    private _createDuplicant(params: ISlimeDuplicantParams): void {
        console.warn('Будет создан новый дупликант делящегося слайма вместо взятия из пула')
        const duplicant = new SlimeDuplicant(
            this.scene, 
            this.character, 
            params
        )
        duplicant.activate()
        duplicant.onDeactivate(() => {
            duplicant.safeDestroy()
        })
    }

    private _activateDuplicant(duplicant: ISlimeDuplicant, params: ISlimeDuplicantParams): void {
        duplicant.reset(params);
        duplicant.activate();
    }

    private _startDuplicating(): void {
        this._stopMoving();
        this.anims.play(this.animationKey.DUPLICATE);
        this.once(`animationcomplete-${this.animationKey.DUPLICATE}`, () => {
            this._duplicate();
            this.deactivate();
        })
    }

    private _duplicate(): void {
        const rightDuplicantParams = this._createDuplicantParams('right', SLIME.DUPLICANT_OFFSET_X, SLIME.DUPLICANT_OFFSET_Y);
        const leftDuplicantParams = this._createDuplicantParams('left', -SLIME.DUPLICANT_OFFSET_X, SLIME.DUPLICANT_OFFSET_Y);

        const duplicants = this.params.duplicantPool.get(2);

        duplicants.forEach((duplicant, index) => {
            const duplicantParams = index > 0 ? rightDuplicantParams : leftDuplicantParams;

            if (!duplicant) {
                this._createDuplicant(duplicantParams);
                return;
            }

            this._activateDuplicant(duplicant, duplicantParams);
        })
    }

    private _sheduleDuplication(): void {
        this._timer = this.scene.time.delayedCall(
            this.params.duplicationDelay, 
            () => {
                this._startDuplicating()
            }
        )
    }

    protected _startActing(): void {
        this._moveDown();
        this._sheduleDuplication();
    }

    protected _stopActing(): void {
        this.anims.stop();
        this._stopMoving();
        this._timer?.destroy();
        this._timer = null;
    }
}