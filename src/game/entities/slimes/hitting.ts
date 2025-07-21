import { IGameScene } from "@/game/scenes/game";
import { ISlime, ISlimeInternalParams, ISlimeParams, Slime } from "./base";
import { SLIME, SlimeTexture, SlimeType } from "./constants";
import { CharacterStateType, ICharacter } from "@/game/entities/character";
import { GAME_EVENTS } from "@/game/systems/gameplay/score";

export interface IHittingSlimeParams extends ISlimeParams {
    attackYThreshold: number
}

export interface IHittingSlime extends ISlime<IHittingSlimeParams, SlimeType.HITTING> {}

export class HittingSlime extends Slime<IHittingSlimeParams, SlimeType.HITTING> implements IHittingSlime {
    private readonly _baseInternalParams: ISlimeInternalParams = {
        vulnerableCharacterStates: [
            CharacterStateType.IDLE,
            CharacterStateType.WALK
        ]
    }

    // персонаж получит урон если столкнется с этим слаймом в атакующей форме в любом состоянии
    private readonly _internalParamsDuringAttack: ISlimeInternalParams = {
        vulnerableCharacterStates: [
            ...this._baseInternalParams.vulnerableCharacterStates,
            CharacterStateType.ATTACK,
            CharacterStateType.DASH
        ]
    }

    constructor(
        scene: IGameScene,
        character: ICharacter,
        params: IHittingSlimeParams
    ) {
        super(
            SlimeType.HITTING,
            scene,
            character,
            SlimeTexture.HITTING,
            params
        )

        this._internalParams = this._baseInternalParams;

        this.setupCollider(SLIME.BODY_WIDTH, SLIME.BODY_HEIGHT, false, true)
    }

    private _attacked: boolean = false;

    protected _startActing(): void {
        this._moveDown();
    }

    private _moveDown(): void {
        this.anims.play(this.animationKey.MOVE_DOWN);
        this.setVelocityY(this.params.speed);
    }

    private _stopMoving(): void {
        this.setVelocity(0)
    }

    protected _stopActing(): void {
        this._stopMoving();
        this._timer?.destroy();
        this._timer = null;
        this.off('animationupdate');
        this.off(`animationcomplete-${this.animationKey.HIT}`);
        this.off(`animationcomplete-${this.animationKey.DIE}`);
    }

    protected _onDeath(): void {
        super._onDeath();
        this._stopMoving();
        if (!this.dealtDamage) {
            this.scene.events.emit(GAME_EVENTS.SLIME_KILLED, {x: this.x, y: this.y})
        }
        this.anims.play(this.animationKey.DIE);
        this.once(`animationcomplete-${this.animationKey.DIE}`, () => {
            this.deactivate()
        });
    }

    private _checkIfEnterAttackZone(): boolean {
        const { attackYThreshold } = this.params;

        return this.y > attackYThreshold + this.height / 2;
    }

    private _attack(): void {
        this._attacked = true;

        this._stopMoving();
        this.anims.play(this.animationKey.HIT)

        this.on('animationupdate', this._handleAttackAnimationUpdate, this);
        this.once(`animationcomplete-${this.animationKey.HIT}`, () => {
            this.off('animationupdate');
            this._moveDown();
        })
    }

    private _isYoyoPhaseOfAttackAnimation: boolean = false;
    private _timer: Phaser.Time.TimerEvent | null = null;

    // приходится хардкодить чтобы прямоугольник коллизии менялся на определенных кадрах
    private _handleAttackAnimationUpdate(
        animation: Phaser.Animations.Animation, 
        frame: Phaser.Animations.AnimationFrame
    ): void {
        const totalFrames = animation.frames.length;
        const currentIndex = frame.index
        
        if (frame.isLast && !this._isYoyoPhaseOfAttackAnimation) {
            this._isYoyoPhaseOfAttackAnimation = true;
            this.anims.pause();
            this._timer = this.scene.time.delayedCall(100, () => {
                this.anims.resume();
            })
            return;
        }
        
        // непосредственно начало атаки
        if (!this._isYoyoPhaseOfAttackAnimation && currentIndex === totalFrames - 3) {
            this.setupCollider(
                SLIME.HITTING_SLIME_ATTACK_BODY_WIDTH, 
                SLIME.HITTING_SLIME_ATTACK_BODY_HEIGHT,
                false,
                true
            )
            this._internalParams = this._internalParamsDuringAttack;
            this.setImmortality(true);    
            this.setCollideWorldBounds(false);
        }
        
        // конец атаки
        if (this._isYoyoPhaseOfAttackAnimation && currentIndex === 7) {
            this.setupCollider(
                SLIME.BODY_WIDTH, 
                SLIME.BODY_HEIGHT,
                false,
                true
            )
            this._internalParams = this._baseInternalParams;
            this.setImmortality(false);
            // this.allowToDamageAgain();    
            this.setCollideWorldBounds(true);
        }
    }

    protected onUpdate(): void {
        super.onUpdate();

        if (!this.isActing) return;

        const shouldAttack = !this._attacked && this._checkIfEnterAttackZone()
        shouldAttack && this._attack();
    }

    reset(params: IHittingSlimeParams): void {
        super.reset(params);
        this._attacked = false;
        this._internalParams = this._baseInternalParams;
        this.setupCollider(SLIME.BODY_WIDTH, SLIME.BODY_HEIGHT, false, true)
        this.setImmortality(false)
        this._isYoyoPhaseOfAttackAnimation = false;
        if (this.anims.isPaused) {
            this.anims.resume()
        }
    }
}