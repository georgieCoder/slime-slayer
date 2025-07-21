import { GameStateManager } from '@/game/systems/state';
import { IScoreSystem, ScoreSystem } from '@/game/systems/gameplay/score';
import { CHARACTER, Character, CharacterStateType, CharacterTexture, ICharacter } from '@/game/entities/character';
import { GameState, IGameStateManager } from '@/game/systems/state';
import { BonusSpawnerManager, ISpawnerManager } from '@/game/systems/gameplay/spawner';
import { SlimeSpawnerManager } from '@/game/systems/gameplay/spawner/manager/slime';
import { DEPTH_LAYERS, WORLD } from '@/game/constants';
import { SlimeParamsMap, SlimeType } from '@/game/entities/slimes';
import { gameEvents } from '@/GameEvents';
import { mainEvents } from '@/MainEvents';
import { BonusParamsMap, BonusType } from '@/game/entities/bonuses';
import { IWaveManager, SlimeWaveManager } from '@/game/systems/gameplay/wave';
import { ParticleSystem } from '@/game/systems/features/particles';

interface ILastData {
    stateManager: IGameStateManager;
    restarted: boolean;
    scoreSystem: IScoreSystem;
}

export interface IGameScene extends Phaser.Scene {
    get currentState(): GameState;
    shakeScreen(): void;
}

export class GameScene extends Phaser.Scene implements IGameScene {
    private character!: ICharacter;
    private stateManager!: IGameStateManager;
    private gameOverSheduled = false;
    private scoreSystem: IScoreSystem | undefined;
    private bonusSpawnerManager!: ISpawnerManager<BonusType, BonusParamsMap>;
    private isStarted = false;
    private restarted = false;
    private slimeWaveManager!: IWaveManager<SlimeType, SlimeParamsMap>;
    private particleEmitter!: ParticleSystem;

    private pause = (): void => {
        if (this.stateManager.state === GameState.PAUSED) return; 
        this.character.currentState === CharacterStateType.WALK && this.character.idle();
        this.stateManager?.changeState(GameState.PAUSED);
    }

    shakeScreen(): void {
        this.cameras.main.shake(70, 0.012);
    }

    private onResumeEvent = (): void => {
        if (this.stateManager.state !== GameState.PAUSED) return;
        this.stateManager.changeState(GameState.PLAYING)
    }

    private onRestartEvent = (): void => {
        this.shutdown();
        this.scene.restart({ 
            stateManager: this.stateManager, 
            restarted: true, 
            scoreSystem: this.scoreSystem
        } as ILastData);
    }



    private startPlaying = (): void => {
        if (this.isStarted) return;
        this.character.enableInput();
        this.isStarted = true;
        this.bonusSpawnerManager.start();
        this.slimeWaveManager.start();
    }

    constructor() {
        super({ key: 'game' });
    }

    init(data: ILastData) {
        this.stateManager = data.stateManager;
        this.restarted = data.restarted;
        this.scoreSystem = data.scoreSystem;
    }

    create() {
        this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT, true, true, false, false);
        this.createBackground()

        if (!this.stateManager) {
            this.stateManager = new GameStateManager(this);
        }

        this.isStarted = false;
        
        this.stateManager.changeState(GameState.PLAYING);

        this.scoreSystem === undefined && this.setupScore();

        this.particleEmitter = new ParticleSystem(this);
        this.particleEmitter.createEmitter({
            width: WORLD.WIDTH,
            depth: DEPTH_LAYERS.ENTITIES.OVER,
            position: { x: 0, y: 0 },
            speedX: { min: -50, max: 50 },
            speedY: { min: 250, max: 300 },
            tint: [0xfff7dc, 0xffca5f, 0xfcf5c6, 0xf96a1c, 0xc82f29],

        })
        this.particleEmitter.stop();

        this.createCharacter();

        this.bonusSpawnerManager = new BonusSpawnerManager(
            this, 
            this.character, 
            [BonusType.DEFENSE, BonusType.HEAL],
            (type) => {
                switch (type) {
                    case BonusType.DEFENSE:
                        return {
                            maxOnScreen: 1,
                            spawnDelay: {min: 20000, max: 30000}
                        }
                    case BonusType.HEAL:
                        return {
                            maxOnScreen: 1,
                            spawnDelay: {min: 20000, max: 30000},
                            firstSpawnDelay: 20000
                        }
                }
            },
            () => ({
                speed: Phaser.Math.Between(100, 150),
                y: WORLD.SPAWN_START_Y,
                x: Phaser.Math.Between(0, 4) * WORLD.SPAWN_BAND_WIDTH + WORLD.SPAWN_BAND_WIDTH / 2
            })
        )

        const slimeSpawnerManager = new SlimeSpawnerManager(
                                        this,
                                        this.character
                                   )
        
        this.slimeWaveManager = new SlimeWaveManager(this, this.character, slimeSpawnerManager, 3000);
        this.slimeWaveManager.onWaveComplete(() => {
            this.scoreSystem?.fixScore();
            gameEvents.emit('WAVE_COMPLETE')
        })

        this.slimeWaveManager.onAllWavesComplete(() => {
            this.particleEmitter.start();
            this.bonusSpawnerManager.stop();
            gameEvents.emit('VICTORY')
        })

        gameEvents.emit("GAME_STARTED", this.restarted, this.slimeWaveManager.waveCount)

        mainEvents.on('START_PLAYING', this.startPlaying)
        mainEvents.on('PAUSE', this.pause)
        mainEvents.on('RESUME', this.onResumeEvent)
        mainEvents.on('RESTART', this.onRestartEvent)
    }

    private createBackground(): void {
        this.add.image(0, 0, 'background')
                .setDepth(DEPTH_LAYERS.BACKGROUND)
                .setOrigin(0)
    }

    private setupScore(): void {
        this.scoreSystem = new ScoreSystem(this, {
            slimeKilled: 100,
            comboMultiplierStep: 0.2,
            comboTimeout: 3000 
        });
    }

    private createCharacter(): void { 
        this.character = new Character(this, CHARACTER.START_X, CHARACTER.START_Y, CharacterTexture, 4);
        this.character.disableInput();
    }

    update(time: number, delta: number): void {
        if (
            this.character.isDead 
            && this.stateManager.state !== GameState.GAME_OVER 
            && !this.gameOverSheduled
        ) {
            this.sheduleGameOver();
        }
    }

    private sheduleGameOver() {
        if (this.gameOverSheduled) return;

        this.gameOverSheduled = true;
        this.time.delayedCall(2000, () => {
            this.stateManager.changeState(GameState.GAME_OVER);
            gameEvents.emit('GAME_OVER')
        });
    }

    get currentState(): GameState {
        return this.stateManager.state;
    }

    shutdown() {
        this.gameOverSheduled = false;
        this.scoreSystem?.reset();
        this.slimeWaveManager.destroy();
        this.particleEmitter.stop();
        this.particleEmitter.destroy();
        this.bonusSpawnerManager.stop();
        this.bonusSpawnerManager.destroy();
        mainEvents.off('START_PLAYING', this.startPlaying)
        mainEvents.off('PAUSE', this.pause)
        mainEvents.off('RESUME', this.onResumeEvent)
        mainEvents.off('RESTART', this.onRestartEvent)
    }
}