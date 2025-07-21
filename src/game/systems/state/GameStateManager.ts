import { GameState } from "./constants";
import { IGameStateManager } from "./types";

export class GameStateManager implements IGameStateManager {
    private currentState: GameState = GameState.PLAYING;

    constructor(readonly scene: Phaser.Scene) {}

    changeState(state: GameState): void {
        if (this.currentState === state) return;

        switch (state) {
            case GameState.GAME_OVER:
                if (this.currentState === GameState.GAME_OVER) return;
                this.pauseGame();
                break;
        
            case GameState.PAUSED:
                if (this.currentState === GameState.GAME_OVER) return;
                this.pauseGame();
                break;

            case GameState.PLAYING:
                this.resumeGame();
                break;
        }

        this.currentState = state;
    }

    private pauseGame() {
        this.scene.scene.pause();
        this.scene.physics.pause();
        this.scene.anims.pauseAll();
        this.pauseAllAnims()
        this.scene.time.paused = true;
    }

    private resumeGame() {
        this.scene.scene.resume();
        this.scene.physics.resume();
        this.scene.anims.resumeAll();
        this.resumeAllAnims()
        this.scene.time.paused = false;
    }

    private pauseAllAnims() {
        this.scene.children.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Sprite && child.anims) {
                child.anims.pause();
            }
        });
    }

    private resumeAllAnims() {
        this.scene.children.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Sprite && child.anims) {
                child.anims.resume();
            }
        });
    }

    get state(): GameState {
        return this.currentState;
    }
}