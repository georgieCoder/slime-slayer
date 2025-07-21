import { GAME, IGameScene } from "@/game/scenes/game";
import { Entity, IEntity } from "..";
import { ICharacter } from "../character";
import { DEPTH_LAYERS } from "@/game/constants";
import { BONUS } from "./constants";
import { IPoolable, Collidable, Poolable } from "@/game/systems/mixins";

export interface IBonusParams {
    speed: number, 
    x: number,
    y: number
}

export interface IBonus extends IPoolable<IBonusParams>, IEntity {
    readonly params: IBonusParams
}


export abstract class Bonus extends Poolable<IBonusParams>()(Collidable(Entity)) implements IBonus {
    private _params: IBonusParams;

    constructor(
        readonly scene: IGameScene,
        readonly character: ICharacter,
        params: IBonusParams,
        texture: string,
        private readonly animationKey: string
    ) {
        super(scene, 0, 0, texture)

        this._params = params;

        this.setDepth(DEPTH_LAYERS.ENTITIES.CHARACTER.OVER);
        this.setScale(BONUS.SCALE);

        this.setupCollider(BONUS.BODY_WIDTH, BONUS.BODY_HEIGHT);
        this.addCollision(this.character, () => this.onCollide());

        this.addCleanupCallback(() => {
            this.destroyAllCollisions()
        })
    }

    get params(): IBonusParams {
        return this._params;
    }

    reset(params?: IBonusParams): void {
        this._params = params ? params : this._params;
    }

    protected _initialize(): void {
        const { x, y, speed } = this._params;

        this.setPosition(x, y)
        this.setVelocityY(speed);
        this.anims.play(this.animationKey);
    }

    protected _preActivate(): void {
        this.enableCollisions();
        this._initialize();
    }

    protected _preDeactivate(): void {
        this.anims.stop();
        this.setVelocityY(0);
        this.disableCollisions();
    }

    protected abstract onCollide(): void;

    protected onUpdate(): void {
        if ( this.checkOutOfBounds( { bottom: true } ) ) this.deactivate();
    }
}