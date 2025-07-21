import { Collidable, IMortal, IPoolable, Mortal, Poolable } from "@/game/systems/mixins"
import { Entity, IEntity } from "../Entity"
import { IGameScene } from "@/game/scenes/game"
import { SLIME, SlimeAnimationKey, SlimeType } from "./constants"
import { CharacterStateType, ICharacter } from "@/game/entities/character"
import { DEPTH_LAYERS, WORLD } from "@/game/constants"
import { GAME_EVENTS } from "@/game/systems/gameplay/score"

export interface ISlimeParams {
    x: number,
    y: number,
    speed: number
}

export interface ISlimeInternalParams {
    vulnerableCharacterStates: CharacterStateType[]
}

const baseInternalParams: ISlimeInternalParams = {
    vulnerableCharacterStates: [CharacterStateType.WALK, CharacterStateType.IDLE]
}

export interface ISlime< TParams extends ISlimeParams, TType extends SlimeType > extends IPoolable< TParams >, IEntity, IMortal {
    readonly isActing: boolean;
    readonly type: TType
    params: TParams
}

export abstract class Slime< TParams extends ISlimeParams, TType extends SlimeType > 
extends Poolable()( Collidable( Mortal( Entity ) ) )
implements ISlime<TParams, TType> {
    params: TParams;

    private _dealtDamage: boolean = false;
    private _isActing: boolean = false;
    protected _internalParams: ISlimeInternalParams;

    protected get dealtDamage(): boolean {
        return this._dealtDamage;
    }

    get isActing(): boolean {
        return this._isActing
    }

    constructor(
        readonly type: TType,
        scene: IGameScene,
        readonly character: ICharacter,
        texture: string,
        publicParams: TParams,
        internalParams: ISlimeInternalParams = baseInternalParams,
    ) {
        super(scene, publicParams.x, publicParams.y, texture)

        this.setDepth(DEPTH_LAYERS.ENTITIES.SLIME.DEFAULT)
        this.setScale(SLIME.SCALE)

        this._internalParams = internalParams;
        this.params = publicParams;

        this.setupCollider(SLIME.BODY_WIDTH, SLIME.BODY_HEIGHT);

        this.addCollision(this.character, () => {
            if (this.isDead || !this.isActive || character.isDead) return;

            const { vulnerableCharacterStates } = this._internalParams;

            const shouldDamage = vulnerableCharacterStates.includes( this.character.currentState ) && !this._dealtDamage;
            if (shouldDamage) {
                this._dealtDamage = true;
                this.character.takeDamage(1)
            } else {
                switch (this.type) {
                    case SlimeType.PROJECTILE:
                        this.character.currentState === CharacterStateType.DASH &&
                        this.scene.events.emit(GAME_EVENTS.PROJECTILE_CAUGHT, {x: this.x, y: this.y})
                        break;
                    case SlimeType.HITTING:
                        break;
                    default:
                        (
                            this.character.currentState === CharacterStateType.DASH ||
                            this.character.currentState === CharacterStateType.ATTACK
                        ) 
                        &&
                        this.scene.events.emit(GAME_EVENTS.SLIME_KILLED, {x: this.x, y: this.y})
                }
            }
            
            this.die();
        })

        this.addCleanupCallback(() => {
            this._stopActing();
        })

        this.setCollideWorldBounds(true)
    }

    // по умолчанию слаймы могут нанести урон только единожды, но иногда нужно позволить им сделать это несколько раз
    // однако чтобы избежать неконтролируемого урона этот метод разрешает ударить повторно только 1 раз, потом его снова нужно вызывать
    protected allowToDamageAgain(): void {
        this._dealtDamage = false;
    }

    private startActing() {
        if (!this._isActing) {
            this._isActing = true;
            this._startActing();
        }
    }

    private stopActing() {
        if (this._isActing) {
            this._isActing = false;
            this._stopActing();
        }
    }

    protected get animationKey(): typeof SlimeAnimationKey[TType] {
        return SlimeAnimationKey[this.type]
    }

    protected _preDeactivate(): void {
        this.stopActing();
    }

    protected _preActivate(): void {
        this.startActing();
    }

    protected _onDeath(): void {
        this.stopActing()
    }

    protected onUpdate(): void {
        if (this.checkOutOfBounds({ bottom: true })) {
            if (this.type !== SlimeType.PROJECTILE) {
                this.scene.shakeScreen();
                this.scene.events.emit(GAME_EVENTS.SLIME_PASSED, {x: this.x, y: WORLD.HEIGHT - SLIME.FRAME_HEIGHT})
            }
            this.deactivate();
        }
    }

    protected abstract _startActing(): void;
    protected abstract _stopActing(): void;

    // приходится перезаписывать метод, чтобы типизировать параметр функции
    // т.к. TypeScript почему-то запрещает передавать дженерики из определения класса в
    // качестве параметров типа миксина
    reset(params: TParams): void {
        this.params = params;
        this._dealtDamage = false;
        this.ressurect();
        this.setPosition(params.x, params.y);
    }
}