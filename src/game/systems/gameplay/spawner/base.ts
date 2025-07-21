import { IEntity } from "@/game/entities";
import { IPoolable } from "@/game/systems/mixins";
import { EntityPool, IEntityPool } from "./pool";

export interface ISpawnerConfig {
    spawnDelay: { min: number, max: number };
    maxOnScreen: number;
    firstSpawnDelay?: number;
    spawnSize?: number;
    forceSpawnInPack?: boolean
}

export interface ISpawner<TParams> {
    readonly activeCount: number;
    readonly config: ISpawnerConfig;
    readonly isActive: boolean;
    start(): void;
    stop(callback?: () => void): void;
    changeSpawnDelay( spawnDelay: { min: number, max: number } ): this;
    changeFirstSpawnDelay( firstSpawnDelay: number ): this;
    changeMaxOnScreen( maxOnScreen: number ): this;
    changeSpawnSize( spawnSize: number ): this;
    applyConfig( config: Partial<ISpawnerConfig> ): this;
    changeParamsCreator(paramsCreator: () => TParams): this;
    destroy(): void;
}

export class Spawner<TParams, T extends IPoolable<TParams> & IEntity = IPoolable<TParams> & IEntity> implements ISpawner<TParams> {
    private _config: ISpawnerConfig;
    private _spawnTimer: Phaser.Time.TimerEvent | undefined;
    private _isActive: boolean = false;
    private _pool: IEntityPool<TParams, T>;
    private _isFirstSpawn: boolean = true;
    private _isTimeToSpawn: boolean = false;
    private _callback: (() => void) | undefined;

    get activeCount(): number {
        return this._pool.activeCount;
    }

    get isActive(): boolean {
        return this._isActive
    }

    constructor(
        readonly scene: Phaser.Scene,
        config: ISpawnerConfig,
        targetCreator: () => T,
        private paramsCreator: () => TParams
    ) {
        this._config = config;
        this._pool = new EntityPool(
            scene, 
            () => targetCreator(), 
            config.maxOnScreen
        );
        this._pool.onDeactivate(() => {
            this.attemptSpawn();
        });
    }

    get config(): ISpawnerConfig {
        return this._config;
    }

    start(): void {
        if (this._isActive) return;
        
        this._isActive = true;
        this._isFirstSpawn = true;
        this.scheduleNextSpawn();
    }

    stop(onceStopCallback?: () => void): void {
        if (!this._isActive) return;

        this._callback = onceStopCallback;

        this._isActive = false;
        this._isFirstSpawn = true;
        this._isTimeToSpawn = false;
        if (this._pool.activeCount === 0) {
            this._spawnTimer?.destroy();
            this._spawnTimer = undefined;
            this._callback && this._callback();
            this._callback = undefined;
        }
    }

    changeSpawnDelay(spawnDelay: { min: number, max: number }): this {
        this._config = { ...this._config, spawnDelay };
        return this;
    }

    changeFirstSpawnDelay(firstSpawnDelay: number): this {
        this._config = { ...this._config, firstSpawnDelay };
        return this;
    }

    changeMaxOnScreen(maxOnScreen: number): this {
        const entitiesToCreate = maxOnScreen - this._config.maxOnScreen;
        this._config = { ...this._config, maxOnScreen };

        entitiesToCreate > 0 && this._pool.extend(entitiesToCreate);

        return this;
    }

    changeSpawnSize( spawnSize: number ): this {
        this._config.spawnSize = spawnSize;

        return this;
    }

    changeForceSpawnInPack( forceSpawnInPack: boolean ): this {
        this._config.forceSpawnInPack = forceSpawnInPack;

        return this;
    }

    applyConfig(config: Partial<ISpawnerConfig>): this {
        config.maxOnScreen !== undefined && this.changeMaxOnScreen(config.maxOnScreen)
        config.spawnDelay !== undefined && this.changeSpawnDelay(config.spawnDelay)
        config.firstSpawnDelay !== undefined && this.changeFirstSpawnDelay(config.firstSpawnDelay)
        config.spawnSize !== undefined && this.changeSpawnSize( config.spawnSize )
        config.forceSpawnInPack !== undefined && this.changeForceSpawnInPack( config.forceSpawnInPack )

        return this;
    }

    changeParamsCreator(paramsCreator: () => TParams) {
        this.paramsCreator = paramsCreator;
        return this;
    }

    private scheduleNextSpawn(): void {
        if (!this._isActive) return;

        this._spawnTimer?.destroy();

        const delay = this._isFirstSpawn 
                      && this._config.firstSpawnDelay !== undefined
                      ? this._config.firstSpawnDelay
                      : Phaser.Math.Between(this._config.spawnDelay.min, this._config.spawnDelay.max);

        this._isFirstSpawn = false;

        this._spawnTimer = this.scene.time.delayedCall(delay, () => {
            this._isTimeToSpawn = true;
            this.attemptSpawn();
        });
    }

    private respawn(targets: T[]): void {
        targets.forEach( target => {
            target.reset(this.paramsCreator());
            target.activate();
        } )
    }

    private attemptSpawn(): void {
        const isAlreadyMaxOnScreen = this._pool.activeCount >= this._config.maxOnScreen;

        if (!this._isActive && this._pool.activeCount === 0) {
            if (this._callback) {
                this._spawnTimer?.destroy();
                this._spawnTimer = undefined;
                this._callback && this._callback();
                this._callback = undefined;
            }
        } 

        if (isAlreadyMaxOnScreen || !this._isTimeToSpawn) return;

        const spawnSize = this.config.spawnSize !== undefined 
                          ? Phaser.Math.Clamp(this.config.spawnSize, 0, 10) 
                          : 1;
        
        const targets = this._pool.get(spawnSize);

        const shouldRespawn = !this.config.forceSpawnInPack 
                              ? true 
                              : targets.length === spawnSize

        shouldRespawn && this.respawn(targets);


        this._isTimeToSpawn = false;
        
        this.scheduleNextSpawn();
    }

    destroy(): void {
        this.stop(() => null);
        this._pool.destroy();
    }
}