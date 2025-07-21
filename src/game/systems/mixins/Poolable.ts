import { SpriteConstructor } from "./types";

export interface IPoolable<TParams = any> {
    deactivate(): void;
    activate(): void;
    reset(params?: TParams): void;
    onDeactivate(callback: () => void): void;
    onActivate(callback: () => void): void;
    readonly isActive: boolean;
}

export function Poolable<TParams = any>() {
    return function<TBase extends SpriteConstructor = SpriteConstructor>(Base: TBase) {
        abstract class PoolableMixin extends Base implements IPoolable<TParams> {

            private _isActive: boolean = false;
            private _onDeactivationCallbacks: (() => void)[] = [];
            private _onActivationCallbacks: (() => void)[] = [];

            constructor(...args: any[]) {
                super(...args); 
                
                this.deactivate()
                this.setActive(false).setVisible(false);
            }

            deactivate(): void {
                if (!this._isActive) return;
                this._preDeactivate();
                this._isActive = false;
                this.setActive(false).setVisible(false);
                this._onDeactivationCallbacks.forEach(callback => callback());
            }

            activate(): void {
                if (this._isActive) return;
                this._preActivate();
                this.setActive(true).setVisible(true);
                this._isActive = true;
                this._onActivationCallbacks.forEach(callback => callback());
            }

            onDeactivate(callback: () => void): void {
                this._onDeactivationCallbacks.push(callback);
            }
            
            onActivate(callback: () => void): void {
                this._onActivationCallbacks.push(callback);
            }

            get isActive(): boolean {
                return this._isActive;
            }

            // Переопределяются наследником
            protected _preActivate(): void {};
            protected _preDeactivate(): void {}
            reset(params?: TParams): void {}
        }

        return PoolableMixin;
    }
}