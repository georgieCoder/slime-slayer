import { ISpawner, ISpawnerConfig } from "@/game/systems/gameplay/spawner";

export interface ISpawnerManager<TType extends string, TParamsMap extends Record<TType, any>> {
    readonly registeredTypes: TType[];

    changeSpawnDelay(spawnDelay: { min: number; max: number }, types?: TType[]): this;
    changeFirstSpawnDelay(firstSpawnDelay: number, types?: TType[]): this;
    changeMaxOnScreen(maxOnScreen: number, types?: TType[]): this;
    applyConfig<T extends readonly TType[]>(configCreator: (type: T[number]) => Partial<ISpawnerConfig>, types: T): this;
    changeParamsCreator<T extends readonly TType[]>(paramsCreator: (type: T[number]) => TParamsMap[T[number]], types: T): this; 
    start(types?: TType[]): void;
    stop(onceStopCallback?: () => void, types?: TType[]): void;
    destroy(types?: TType[]): void;
    registerTypes<T extends readonly TType[]>(
            slimeTypes: T,
            paramsCreator: (slimeType: T[number]) => TParamsMap[T[number]],
            configCreator: (slimeType: T[number]) => ISpawnerConfig,
            immediateStart?: boolean
    ): void
}

export abstract class SpawnerManager<TType extends string, TParamsMap extends Record<TType, any>> implements ISpawnerManager<TType, TParamsMap> {
    private _spawners: Map<TType, ISpawner<TParamsMap[TType]>> = new Map();
    protected _registeredTypes: TType[] = [];

    get registeredTypes(): TType[] {
        return this._registeredTypes
    }

    // метод для добавления спавнеров наследником
    // публичный вариант должен создасться наследником
    protected extend<const T extends readonly TType[]>(
        types: T,
        spawnerCreator: (type: T[number]) => ISpawner<TParamsMap[T[number]]>,
        immediateStart: boolean = false
    ): void {
        types.forEach(type => {
            if (!this._spawners.has(type)) {
                const spawner = spawnerCreator(type);
                this._spawners.set(type, spawner);
                this._registeredTypes.push(type);
                immediateStart && spawner.start()
            }
        });
    }

    abstract registerTypes<T extends readonly TType[]>(
            slimeTypes: T,
            paramsCreator: (slimeType: T[number]) => TParamsMap[T[number]],
            configCreator: (slimeType: T[number]) => ISpawnerConfig,
            immediateStart?: boolean
    ): void
    
    changeSpawnDelay(spawnDelay: { min: number; max: number }, types?: TType[]): this {
        const targets = types ?? this._registeredTypes;
        targets.forEach(type => this._spawners.get(type)?.changeSpawnDelay(spawnDelay));
        return this;
    }

    changeFirstSpawnDelay(firstSpawnDelay: number, types?: TType[]): this {
        const targets = types ?? this._registeredTypes;
        targets.forEach(type => this._spawners.get(type)?.changeFirstSpawnDelay(firstSpawnDelay));
        return this;
    }

    changeMaxOnScreen(maxOnScreen: number, types?: TType[]): this {
        const targets = types ?? this._registeredTypes;
        targets.forEach(type => this._spawners.get(type)?.changeMaxOnScreen(maxOnScreen));
        return this;
    }

    applyConfig<T extends readonly TType[]>(configCreator: (type: T[number]) => ISpawnerConfig, types: T): this {
        types.forEach(type => this._spawners.get(type)?.applyConfig( configCreator(type) ));
        return this;
    }

    changeParamsCreator<T extends readonly TType[]>(paramsCreator: (type: T[number]) => TParamsMap[T[number]], types: T): this {
        types.forEach(
            type => this._spawners
                        .get(type)
                        ?.changeParamsCreator( () => paramsCreator(type) )
        )
        
        return this;
    }

    start(types?: TType[]): void {
        const targets = types ?? this._registeredTypes;
        targets.forEach(type => this._spawners.get(type)?.start());
    }

    stop(onceStopCallback?: () => void, types?: TType[]): void {
        const targets = types ? types.map(type => this._spawners.get(type)!) : Array.from(this._spawners.values()).filter(spawner => spawner.isActive);
        let stoppedSpawners = 0;
        let spawnerCountToStop = targets.length;

        const _onceStopCallback = () => {
            stoppedSpawners++;
            if (stoppedSpawners === spawnerCountToStop) {
                onceStopCallback && onceStopCallback()
            }
        }

        if (targets.length === 0) {
            onceStopCallback && onceStopCallback();
            return;
        }

        targets.forEach(spawner => spawner.stop(() => _onceStopCallback()));
    }

    destroy(types?: TType[]): void {
        if (!types) {
            this._spawners.forEach(spawner => spawner.destroy());
            this._spawners.clear();
            this._registeredTypes = [];
        } else {
            types.forEach(type => {
                this._spawners.get(type)?.destroy();
                this._spawners.delete(type);
                this._registeredTypes = this._registeredTypes.filter(t => t !== type);
            });
        }
    }
}