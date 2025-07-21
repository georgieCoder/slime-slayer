import { ISpawnerConfig, ISpawnerManager } from "../spawner";
import { IGameScene } from "@/game/scenes/game";
import { IWaveConfig } from "./types";


export interface IWave<
    TType extends string, 
    TParamsMap extends Record<TType, object>
> {
    readonly registeredTypes: TType[];
    readonly scene: IGameScene;
    readonly currentStage: number;
    readonly config: IWaveConfig<TType, TParamsMap>,
    readonly spawnerManager: ISpawnerManager<TType, TParamsMap>,
    start(): void,
    complete(): void,
    onComplete(callback: () => void): void,
    destroy(): void;
}

export class Wave <
    TType extends string,
    TParamsMap extends Record<TType, object>
> implements IWave<TType, TParamsMap> {
    private _isSpawnerManagerSetup: boolean = false;
    private _onCompleteCallbacks: (() => void)[] = [];
    private _currentStage = -1;
    private _stageTimeout: Phaser.Time.TimerEvent | null = null;
    private _waveTimeout: Phaser.Time.TimerEvent | null = null;

    get currentStage(): number {
        return this._currentStage;
    }

    get registeredTypes(): TType[] {
        return this.config.registeredTypes;
    }

    constructor(
        readonly scene: IGameScene,
        readonly config: IWaveConfig<TType, TParamsMap>,
        readonly spawnerManager: ISpawnerManager<TType, TParamsMap>
    ) {}

    start(): void {
        this._startInitialStage();

        this.spawnerManager.start(this.config.registeredTypes);

        const initialStageDuration = this.config.initialStage.duration;
        const waveDuration = this.config.duration;  

        this._sheduleNextStage(initialStageDuration)

        this._waveTimeout?.destroy();
        this._waveTimeout = null;

        if (waveDuration > 0) {
            this._waveTimeout = this.scene.time.delayedCall(
                waveDuration, 
                () => this.complete()
            )
        } else if (waveDuration === 0) {
            this.complete();
        }
    }

    complete(): void {
        this._waveTimeout?.destroy();
        this._waveTimeout = null;
        this._stageTimeout?.destroy();
        this._stageTimeout = null;
        this._isSpawnerManagerSetup = false;
        this.spawnerManager.stop(() => {
            this._onCompleteCallbacks.forEach(callback => callback());
            this._onCompleteCallbacks = [];
        })
    }

    onComplete(callback: () => void): void {
        this._onCompleteCallbacks.push(callback);
    }

    private _startNextStage(): void {
        const stageToStart = this.config.stages ? this.config.stages[++this._currentStage] : undefined;

        if (!stageToStart) {
            this.complete();
            return;
        }

        const { paramChanges, configChanges } = stageToStart;
        
        const currentParamsCreator = (type: TType): TParamsMap[TType] => ({
            ...this.config.initialStage.paramsCreator(type)!,
            ...paramChanges(type)
        })

        if (!currentParamsCreator) {
            console.warn('Ошибка в воспроизведении волны, волна автоматически завершится')
            this.complete();
            return;
        }

        this.spawnerManager.changeParamsCreator(
            (type) => currentParamsCreator(type),
             this.registeredTypes
        );

        this.spawnerManager.applyConfig(
            (type) => configChanges(type), 
            this.registeredTypes
        )

        this._sheduleNextStage(stageToStart.duration);
    }
    
    // если задержка отрицательная, то этап будет длиться бесконечно, пока длится волна
    // если равна нулю - закончится сразу
    // если положительная - по таймеру
    private _sheduleNextStage(delay: number): void {
        this._stageTimeout?.destroy();
        this._stageTimeout = null;
        if (delay > 0) {
            this._stageTimeout = this.scene.time.delayedCall(
                delay, 
                () => this._startNextStage()
            ) 
        } else if (delay === 0) {
            this._startNextStage();
        }
    }

    private _startInitialStage(): void {
        if (this._isSpawnerManagerSetup) return;

        const {paramsCreator, configCreator} = this.config.initialStage;

        const alreadyRegisteredTypes = this.spawnerManager.registeredTypes;

        const typesToRegister: TType[] = [];
        const typesToModify: TType[] = [];

        const typesToCheck = this.registeredTypes;

        typesToCheck.forEach(type => {
            alreadyRegisteredTypes.includes(type)
            ? typesToModify.push(type)
            : typesToRegister.push(type)
        })

       this.spawnerManager.registerTypes(
            typesToRegister, 
            (type) => paramsCreator(type)!,
            (type) => configCreator(type)!
        )

        this.spawnerManager.changeParamsCreator(
            (type) => paramsCreator(type)!,
            typesToModify
        );

        this.spawnerManager.applyConfig(
            (type) => configCreator(type)!,
            typesToModify
        )

        this._isSpawnerManagerSetup = true;
    }

    destroy(): void {
        this._stageTimeout?.destroy();
        this._stageTimeout = null;
        this._waveTimeout?.destroy();
        this._waveTimeout = null;
    }
}