import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeParams, Slime } from "./base";
import { SlimeTexture, SlimeType } from "./constants";
import { CharacterStateType, ICharacter } from "@/game/entities/character";
import { DEPTH_LAYERS } from "@/game/constants";

export interface IHidingSlimeParams extends ISlimeParams {
    hidingZone: {minY: number, maxY: number},
    speedDuringHiding: number
}

export interface IHidingSlime extends ISlime<IHidingSlimeParams, SlimeType.HIDING> {}

export class HidingSlime extends Slime<IHidingSlimeParams, SlimeType.HIDING> implements IHidingSlime {
    private _isHiding: boolean = false;

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: IHidingSlimeParams
    ) {
        super(
            SlimeType.HIDING,
            scene,
            character,
            SlimeTexture.HIDING,
            params
        )

        // слайм плохо выровнен на спрайтшите, поэтому приходится дополнительно смещать коллайдер
        this.body && this.setOffset(this.body.offset.x, this.body.offset.y + 12);
    }

    protected _startActing(): void {
        this.setDepth(DEPTH_LAYERS.ENTITIES.SLIME.DEFAULT)
        this._moveDown();
    }

    private _moveDown(): void {
        const requiredSpeed = this._isHiding ? this.params.speedDuringHiding : this.params.speed;
        const animationToPlay = this._isHiding ? this.animationKey.MOVE_DOWN_HIDING : this.animationKey.MOVE_DOWN_NORMALLY;

        this.setVelocityY(requiredSpeed);
        this.anims.play(animationToPlay);
    }

    private _stopMoving(): void {
        this.setVelocity(0);
    }

    private _checkIfSlimeInHidingZone(): boolean {
        const { minY, maxY } = this.params.hidingZone;

        return this.y > minY + this.height / 2 && this.y < maxY + this.height / 2;
    }

    private _checkIfExitHidingZone(): boolean {
        const { maxY } = this.params.hidingZone;

        return this.y > maxY + this.height / 2;
    }

    private _hide(): void {
        this._stopMoving();
        this.anims.play(this.animationKey.HIDE);
        this.setImmortality(true);
        this.disableCollisions();
        this.once(`animationcomplete-${this.animationKey.HIDE}`, () => {
            this.setDepth(DEPTH_LAYERS.ENTITIES.SLIME.UNDER)
            this._moveDown();
        })
    }

    private _stopHiding(): void {
        this._stopMoving();
        this.setImmortality(false);
        this.enableCollisions();
        this.playReverse(this.animationKey.HIDE);

        this.once(`animationcomplete-${this.animationKey.HIDE}`, () => {
            this.setDepth(DEPTH_LAYERS.ENTITIES.SLIME.DEFAULT)
            this._moveDown();
        })
    }

    protected _stopActing(): void {
        this._stopMoving();
        this.off(`animationcomplete-${this.animationKey.HIDE}`);
        this.off(`animationcomplete-${this.animationKey.DIE}`);
    }

    protected _onDeath(): void {
        this._stopMoving();
        this.anims.play(this.animationKey.DIE);
        this.once(`animationcomplete-${this.animationKey.DIE}`, () => {
            this.deactivate()
        })
    }

    protected onUpdate(): void {
        super.onUpdate()

        if (!this.isActing) return;

        const shouldHide = !this._isHiding && this._checkIfSlimeInHidingZone();

        if (shouldHide) {
            this._isHiding = true;
            this._hide();
            return;
        }

        const shouldStopHiding = this._isHiding && this._checkIfExitHidingZone();

        if (shouldStopHiding) {
            this._isHiding = false;
            this._stopHiding();
            return;
        }
    }

    reset(params: IHidingSlimeParams): void {
        super.reset(params);

        this._isHiding = false;
    }
}