import { gameEvents } from "@/GameEvents";
import { GAME_EVENTS, ScoreSystemConfig } from "./types";

export interface IScoreSystem {
    readonly config: ScoreSystemConfig;
    getCurrentScore(): number;
    getCurrentCombo(): number;
    getCurrentMultiplier(): number;
    destroy(): void;
    fixScore(): void;
    reset(): void;
}

export class ScoreSystem implements IScoreSystem {
    private score = 0;
    private combo = 0;
    private comboMultiplier = 1;
    private scene: Phaser.Scene;
    private comboTimeout: Phaser.Time.TimerEvent | null = null;
    private multipleKillThreshold = 200;
    private multipleKillTimer: Phaser.Time.TimerEvent | null = null;
    private slimeKilled = 0;
    private lastKilledSlimePosition: {x: number, y: number} | undefined;
    private currentInitiator: {event: GAME_EVENTS, position: {x: number, y: number}} | undefined;
    private minScore = 0;
    readonly config: ScoreSystemConfig;

    constructor(scene: Phaser.Scene, config?: Partial<ScoreSystemConfig>) {
        this.scene = scene;
        
        this.config = {
            slimePassed: -90,
            slimeKilled: 100,
            projectileCaught: 50,
            comboMultiplierStep: 0.2,
            comboTimeout: 5000,
            ...config
        };

        this.setupEventListeners();
    }

    fixScore(): void {
        this.minScore = this.score;
    }

    private setupEventListeners(): void {
        this.scene.events.on(GAME_EVENTS.SLIME_KILLED, this.onSlimeKilled, this);
        this.scene.events.on(GAME_EVENTS.CHARACTER_TOOK_DAMAGE, this.onTookDamage, this);
        this.scene.events.on(GAME_EVENTS.SLIME_PASSED, this.onSlimePassed, this);
        this.scene.events.on(GAME_EVENTS.PROJECTILE_CAUGHT, this.onProjectileCaught, this);
    }

    private resetComboTimer(): void {
        if (this.comboTimeout) {
            this.comboTimeout.destroy();
        }
        
        // this.comboTimeout = this.scene.time.delayedCall(
        //     this.config.comboTimeout,
        //     () => {
        //         if (this.combo > 0) {
        //             this.resetCombo();
        //         }
        //     }
        // );
    }

    private onSlimeKilled(position: {x: number, y: number}): void {
        this.currentInitiator = {event: GAME_EVENTS.SLIME_KILLED, position};
        if (!this.multipleKillTimer) {
            this.multipleKillTimer = this.scene.time.delayedCall(
                this.multipleKillThreshold, 
                () => {
                    if (this.slimeKilled > 1) {
                        if (this.lastKilledSlimePosition) {
                            gameEvents.emit('MULTIPLE_KILL', this.slimeKilled, this.lastKilledSlimePosition);
                        }
                    }
                    this.slimeKilled = 0;
                    this.multipleKillTimer?.destroy();
                    this.multipleKillTimer = null;
                },
            )
        }
        this.slimeKilled++;
        this.increaseCombo();
        const points = this.config.slimeKilled * this.comboMultiplier;
        this.addScore(points);
        this.resetComboTimer();
        this.lastKilledSlimePosition = position;
    }

    private onTookDamage(position: {x: number, y: number}): void {
        this.currentInitiator = {event: GAME_EVENTS.CHARACTER_TOOK_DAMAGE, position};
        gameEvents.emit('CHARACTER_TOOK_DAMAGE', position)
        this.resetCombo();
    }

    private onSlimePassed(position: {x: number, y: number}): void {
        this.currentInitiator = {event: GAME_EVENTS.SLIME_PASSED, position};
        this.resetCombo();
        this.addScore(this.config.slimePassed);
    }

    private onProjectileCaught(position: {x: number, y: number}): void {
        this.currentInitiator = {event: GAME_EVENTS.PROJECTILE_CAUGHT, position};
        this.increaseCombo();
        const points = this.config.projectileCaught * this.comboMultiplier;
        this.addScore(points);
    }

    private addScore(points: number): void {
        const lastScore = this.score;
        this.score += Math.floor(points);
        this.score = Math.max(this.minScore, this.score); 
        gameEvents.emit('CHANGE_SCORE', this.score, this.currentInitiator?.position,  this.score - lastScore);
    }

    private increaseCombo(): void {
        this.combo++;
        this.comboMultiplier = 1 + (this.combo * this.config.comboMultiplierStep);
    }

    private resetCombo(): void {
        if (this.combo > 0) {
            this.combo = 0;
            this.comboMultiplier = 1;
            
            this.comboTimeout?.destroy();
            this.comboTimeout = null;

            gameEvents.emit('COMBO_RESET')
        }
    }

    public getCurrentScore(): number {
        return this.score;
    }

    public getCurrentCombo(): number {
        return this.combo;
    }

    public getCurrentMultiplier(): number {
        return this.comboMultiplier;
    }

    public destroy(): void {
        this.scene.events.off(GAME_EVENTS.SLIME_KILLED, this.onSlimeKilled, this);
        this.scene.events.off(GAME_EVENTS.CHARACTER_TOOK_DAMAGE, this.onTookDamage, this);
        this.scene.events.off(GAME_EVENTS.SLIME_PASSED, this.onSlimePassed, this);
        this.scene.events.off(GAME_EVENTS.PROJECTILE_CAUGHT, this.onProjectileCaught, this);
        
        if (this.comboTimeout) {
            this.comboTimeout.destroy();
        }
    }

    reset(): void {
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboTimeout?.destroy();
        this.comboTimeout = null;
        this.minScore = 0;
    }
}