import { EventEmitter } from "events";

interface GameEvents {
  LOAD_STARTED: () => void;
  LOAD_PROGRESS: (progress: number) => void;
  GAME_STARTED: (restarted: boolean, waveCount: number) => void;
  GAME_OVER: () => void;
  CHANGE_SCORE: (value: number, position?: {x: number, y: number}, scoreDifference?: number) => void;
  WAVE_COMPLETE: () => void;
  VICTORY: () => void;
  MULTIPLE_KILL: (multiplier: number, position: {x: number, y: number}) => void;
  COMBO_RESET: () => void;
  CHARACTER_TOOK_DAMAGE: (position: {x: number, y: number}) => void;
}

class TypedEventEmitter extends EventEmitter {
  emit<T extends keyof GameEvents>(event: T, ...args: Parameters<GameEvents[T]>): boolean {
    return super.emit(event as string, ...args);
  }

  on<T extends keyof GameEvents>(event: T, listener: GameEvents[T]): this {
    return super.on(event as string, listener);
  }

  off<T extends keyof GameEvents>(event: T, listener: GameEvents[T]): this {
    return super.off(event as string, listener);
  }
}

export const gameEvents = new TypedEventEmitter();