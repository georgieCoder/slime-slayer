import { Constructor } from "./types";

export interface IMortal {
    readonly isDead: boolean;
    readonly isImmortal: boolean;
    die(): void;
    setImmortality(value: boolean): void;
}

export function Mortal<TBase extends Constructor = Constructor>(Base: TBase) {
    abstract class MortalMixin extends Base implements IMortal {
        private _isDead: boolean = false;
        private _isImmortal: boolean = false;

        get isDead(): boolean {
            return this._isDead;
        }

        get isImmortal(): boolean {
            return this._isImmortal;
        }

        die() {
            if (this._isDead || this.isImmortal) return;
            this._isDead = true;
            this._onDeath();
        }

        ressurect() {
            if (!this._isDead) return;
            this._isDead = false;
            this._onRessurect();
        }

        setImmortality(value: boolean): void {
            this._isImmortal = value;
        }

        // Переопределяются наследниками
        protected _onDeath(): void {}
        protected _onRessurect(): void {}
    };

    return MortalMixin
}