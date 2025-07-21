import { IGameScene } from "@/game/scenes/game";
import { ISpawnerManager } from "../spawner";
import { IWaveConfig } from "./types";
import { IWave, Wave } from "./wave";
import { SlimeParamsMap, SlimeType } from "@/game/entities/slimes";
import { ICharacter } from "@/game/entities/character";
import { getSlimeWaveConfigs } from "./configs";

export interface IWaveManager<
    TType extends string, 
    TParamsMap extends Record<TType, object>
> {
    readonly scene: IGameScene;
    readonly spawnerManager: ISpawnerManager<TType, TParamsMap>;
    readonly waveChangeDelay: number;
    readonly waveCount: number;
    readonly currentWave: number;

    start(): void;
    onWaveComplete(callback: (wave: number) => void): void;
    onAllWavesComplete(callback: () => void): void;
    destroy(): void;
}

abstract class WaveManager<
    TType extends string,
    TParamsMap extends Record<TType, object>
> implements IWaveManager<TType, TParamsMap> {
    private _onWaveCompleteCallbacks: ((wave: number) => void)[] = [];
    private _onAllWavesCompleteCallbacks: (() => void)[] = [];
    private _currentWave = 0;
    private _waveChangeDelay: number;
    private _changeWaveTimeout: Phaser.Time.TimerEvent | null = null;

    get waveChangeDelay(): number {
        return this._waveChangeDelay;
    }

    get waveCount(): number {
        return this.waves.length
    }

    get currentWave(): number {
        return this._currentWave;
    }

    constructor(
        readonly scene: IGameScene,
        readonly spawnerManager: ISpawnerManager<TType, TParamsMap>,
        private waves: IWave<TType, TParamsMap>[],
        waveChangeDelay = 0
    ) {
        this._waveChangeDelay = waveChangeDelay;
        spawnerManager.stop();
    }

    onWaveComplete(callback: (wave: number) => void): void {
        this._onWaveCompleteCallbacks.push(callback)
    }

    onAllWavesComplete(callback: () => void): void {
        this._onAllWavesCompleteCallbacks.push(callback)
    }

    start() {
        const waveToStart = this.waves[0];

        if (!waveToStart) {
            console.warn('Не была найдена первая волна, запуск очереди волн невозможен')
            return;
        }

        waveToStart.onComplete(() => {
            waveToStart.destroy();
            this._onWaveCompleteCallbacks.forEach(callback => callback(this._currentWave))
            this._checkIfExistNextWave()
            ? this._startNextWave()
            : this._complete()
        })

        waveToStart.start();
    }

    destroy(): void {
        this.waves.forEach(wave => wave.destroy())
        this._changeWaveTimeout?.destroy();
        this._changeWaveTimeout = null;
    }

    private _checkIfExistNextWave(): boolean {
        return typeof this.waves[this._currentWave + 1] !== 'undefined';
    }

    private _startNextWave() {
        this._changeWaveTimeout?.destroy();
        this._changeWaveTimeout = this.scene.time.delayedCall(
            this._waveChangeDelay, 
            () => {
                this._currentWave++;
                const waveToStart = this.waves[this._currentWave];

                waveToStart.start();
                waveToStart.onComplete(() => {
                    this._onWaveCompleteCallbacks.forEach(callback => callback(this._currentWave))
                    waveToStart.destroy();
                    this._checkIfExistNextWave()
                    ? this._startNextWave()
                    : this._complete()
                })
            }
        )
    }

    private _complete() {
        this._changeWaveTimeout?.destroy();
        this._changeWaveTimeout = null;
        this._onAllWavesCompleteCallbacks.forEach(callback => callback())
    }
}

export class SlimeWaveManager extends WaveManager<SlimeType, SlimeParamsMap> {
    constructor(
        scene: IGameScene,
        character: ICharacter,
        spawnerManager: ISpawnerManager<SlimeType, SlimeParamsMap>,
        waveChangeDelay = 0
    ) {
        const configs = getSlimeWaveConfigs(scene, character);
        const waves = configs.map(config => new Wave(scene, config, spawnerManager));

        super(
            scene,
            spawnerManager,
            waves,
            waveChangeDelay
        )
    }
}