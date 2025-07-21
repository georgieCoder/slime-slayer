import { IEntity } from "@/game/entities";
import { IPoolable } from "@/game/systems/mixins";

export interface IEntityPool<TParams, T extends IPoolable<TParams> & IEntity> {
    readonly length: number;
    readonly activeCount: number;
    get(): T | undefined;
    get(n: number): T[];
    getAllActive(): T[];
    extend(count: number): void;
    destroy(): void;
    onDeactivate(callback: (deactivatedObject: T) => void): void
}

export class EntityPool<TParams, T extends IPoolable<TParams> & IEntity> implements IEntityPool<TParams, T> {
    private _pool: Phaser.GameObjects.Group;
    private _activeObjects: Set<T> = new Set();
    private _callbacks: ((deactivatedObject: T) => void)[] = [];

    get length(): number {
        return this._pool.getLength();
    }

    get activeCount(): number {
        return this._activeObjects.size;
    }
    
    constructor(
        private scene: Phaser.Scene,
        private poolableObjectFactory: () => T,
        private initialSize: number
    ) {
        // this._pool = this.scene.add.group({
        //     classType: Phaser.GameObjects.Sprite,
        //     maxSize: initialSize,
        //     runChildUpdate: false
        // });
        this._pool = new Phaser.GameObjects.Group(this.scene)
        this._fillPool();
    }

    get(): T | undefined;
    get(n: number): T[];
    get(n?: number): T | T[] | undefined {
        if (n === undefined) return this._pool.getFirstDead(false);

        const inactiveObjects: T[] = [];

        this._pool.children.iterate(child => {
            if (inactiveObjects.length === n) return false;

            if (!child.active) {
                inactiveObjects.push(child as T)
            }

            return true;
        })

        return inactiveObjects;
    }

    extend(count: number): void {
        this._pool.maxSize = this.length + count;
        this._createPoolableObjects(count);
    }

    onDeactivate(callback: (deactivatedObject: T) => void): void {
        this._callbacks.push(callback);
    }

    getAllActive(): T[] {
        return Array.from(this._activeObjects);
    }

    destroy() {
        this._pool.clear(true, true);
        this._pool.destroy();
    }

    private _fillPool() {
        if (this.length >= this.initialSize) return;

        this._createPoolableObjects(this.initialSize - this.length);
    }

    private _createPoolableObjects(count: number) {
        for (let i = 0; i < count; i++) {
            const poolableObject = this._createPoolableObject();
            this._pool.add( poolableObject );
        }
    }

    private _createPoolableObject(): T {
        const poolableObject = this.poolableObjectFactory();

        poolableObject.onDeactivate(() => {
            this._activeObjects.delete( poolableObject );
            this._pool.add( poolableObject );
            this._callbacks.forEach(callback => callback(poolableObject))
        });

        poolableObject.onActivate(() => {
            this._activeObjects.add(poolableObject)
        })

        this._pool.add( poolableObject );
        this._callbacks.forEach(callback => callback(poolableObject))

        return poolableObject;
    }
}