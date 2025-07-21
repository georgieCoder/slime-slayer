import { GameState } from "./constants";

export interface IGameStateManager {
    changeState(state: GameState): void;
    readonly state: GameState;
}