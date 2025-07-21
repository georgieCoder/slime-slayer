import { Constructor } from "./types";

const MAX_HEALTH_ERROR_TEXT = 'перед тем как использовать публичные методы нужно установить значение maxHealth с помощью защищенного метода setMaxHealth'

export interface IWithHealth {
    takeDamage(value: number): void;
    heal(value: number): void;
    setInvulnerability(value: boolean): void;
    readonly maxHealth: number;
    readonly health: number;
    readonly isInvulnerable: boolean;
    readonly isAlive: boolean;
}

export function WithHealth<TBase extends Constructor = Constructor>(Base: TBase) {
    abstract class WithHealthMixin extends Base implements IWithHealth {
        private _health: number = 0;
        private _maxHealth: number | undefined;
        private _isInvulnerable: boolean = false;
        private _isAlive: boolean = true;

        get health(): number {
            return this._health
        }

        get maxHealth(): number {
            if (this._maxHealth === undefined) throw new Error(MAX_HEALTH_ERROR_TEXT)
            return this._maxHealth
        }

        get isAlive(): boolean {
            return this._isAlive;
        }

        get isInvulnerable(): boolean {
            return this._isInvulnerable;
        }

        takeDamage(value: number): void {
            if (this._maxHealth === undefined) throw new Error(MAX_HEALTH_ERROR_TEXT);
            if (this.isInvulnerable) {
                this._onTakingDamage(this._health, false);
                return;
            }

            const lastHealth = this.health;

            this._health -= value;
            this._health = Phaser.Math.Clamp(this._health, 0, this._maxHealth)

            if (this._health === 0) {
                this._isAlive = false;
            }

            this._onTakingDamage(this._health, lastHealth !== this._health);
        }

        heal(value: number): void {
            if (this._maxHealth === undefined) throw new Error(MAX_HEALTH_ERROR_TEXT)

            const lastHealth = this.health;
        
            this._health += value;
            this._health = Phaser.Math.Clamp(this._health, 0, this._maxHealth)

            this._onHealing(this._health, lastHealth !== this._health);
        }

        setInvulnerability(value: boolean): void {
            const lastInvulnerability = this.isInvulnerable;
            this._isInvulnerable = value;
            this._onSetInvulnerability(this.isInvulnerable, lastInvulnerability !== this.isInvulnerable)
        }

        protected setMaxHealth(value: number): void {
            if (value < 0) throw new Error('значение value в методе setMaxHealth должно быть >= 0')
            this._maxHealth = value;
            this._health = this._maxHealth;
        }

        protected _onTakingDamage(currentHealth: number, isDifference: boolean): void {}
        protected _onSetInvulnerability(currentValue: boolean, isDifference: boolean): void {}
        protected _onHealing(currentHealth: number, isDifference: boolean): void {}
    }

    return WithHealthMixin
}