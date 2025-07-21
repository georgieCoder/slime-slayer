import { EventEmitter } from 'events';

interface IMainEvents {
  START_LOADING: () => void;
  STOP_LOADING: () => void;
  START_PLAYING: () => void;
  PAUSE: () => void;
  RESUME: () => void;
  RESTART: () => void;
}

class TypedEventEmitter extends EventEmitter {
  emit<T extends keyof IMainEvents>(event: T, ...args: Parameters<IMainEvents[T]>): boolean {
    return super.emit(event as string, ...args);
  }

  on<T extends keyof IMainEvents>(event: T, listener: IMainEvents[T]): this {
    return super.on(event as string, listener);
  }

  off<T extends keyof IMainEvents>(event: T, listener: IMainEvents[T]): this {
    return super.off(event as string, listener);
  }
}

export const mainEvents = new TypedEventEmitter();

export { EventEmitter };
