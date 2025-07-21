import { GAME_EVENTS } from '@/game/systems/gameplay/score';
import { CHARACTER, CharacterAnimationKey, CharacterStateType } from './constants';
import { DEPTH_LAYERS } from '@/game/constants';
import { IEntity, Entity } from '@/game/entities';
import { IHealthBar, HealthBar } from '@/game/ui/hud';
import { Collidable, IMortal, IWithHealth, Mortal, WithHealth } from '@/game/systems/mixins';
import { CharacterInputController, ICharacterInputController } from './input';
import { IGameScene } from '@/game/scenes/game';

export interface ICharacter extends IEntity, IMortal, IWithHealth {
    walk(direction: 'right' | 'left'): void;
    dash(direction: 'right' | 'left'): void;
    attack(): void;
    idle(): void;
    disableInput(): void;
    enableInput(): void;
    readonly currentState: CharacterStateType;
}

export class Character extends Collidable(WithHealth(Mortal(Entity))) implements ICharacter {
    private _healthBar: IHealthBar;
    private _attackTimer: Phaser.Time.TimerEvent | null = null;
    private _dashTimer: Phaser.Time.TimerEvent | null = null;
    private _currentState: CharacterStateType;
    private _inputController: ICharacterInputController;

    get currentState(): CharacterStateType {
        return this._currentState;
    }

    constructor(scene: IGameScene, x: number, y: number, texture: string, maxHealth: number) {
        super(scene, x, y, texture);

        this.setupCollider(CHARACTER.WIDTH, CHARACTER.HEIGHT);

        this.setCollideWorldBounds();

        this._healthBar = new HealthBar(scene, x, y, 0, -50, maxHealth, false);

        this.setScale(CHARACTER.SCALE);
        this.setDepth(DEPTH_LAYERS.ENTITIES.CHARACTER.DEFAULT);

        this.addCleanupCallback(() => {
            this._healthBar.destroy();
            this._attackTimer?.destroy();
            this._attackTimer = null;
            this._dashTimer?.destroy();
            this._dashTimer = null;
            this._inputController.destroy();
        })

        this.setMaxHealth(maxHealth);

        this._inputController = new CharacterInputController(this.scene, this);

        this.idle();
        this._currentState = CharacterStateType.IDLE;
    }


    walk(direction: 'right' | 'left'): void {
        this.setVelocity(
            direction === 'left' ? -CHARACTER.WALK_SPEED : CHARACTER.WALK_SPEED,
            0
        );
        this.anims.play(CharacterAnimationKey.WALK_RIGHT, true);
        this.flipX = direction === 'left';
        this._currentState = CharacterStateType.WALK;
    }

    dash(direction: 'right' | 'left'): void {
        this.disableInput();
        this.anims.play(CharacterAnimationKey.DASH_RIGHT);
        this.flipX = direction === 'left';

        this.setVelocity(
            direction === 'left' ? -CHARACTER.DASH_SPEED : CHARACTER.DASH_SPEED,
            0
        );

        const dashDuration = CHARACTER.DASH_DISTANCE / CHARACTER.DASH_SPEED * 1000;
        this._dashTimer?.destroy();
        this._dashTimer = this.scene.time.delayedCall(dashDuration, () => {
            this._dashTimer?.destroy();
            this._dashTimer = null;
            this.idle()
        })

        this._currentState = CharacterStateType.DASH;
    }

    attack(): void {
        this.disableInput();
        this.anims.play(CharacterAnimationKey.DASH_UP);

        this.setVelocity(0, -CHARACTER.ATTACK_SPEED);
        const attackDuration = CHARACTER.ATTACK_DISTANCE / CHARACTER.DASH_SPEED * 1000;

        this._attackTimer?.destroy();
        this._attackTimer = this.scene.time.delayedCall(attackDuration, () => {
            this.setVelocityY(CHARACTER.ATTACK_SPEED)
            this._attackTimer?.destroy();
            this._attackTimer = this.scene.time.delayedCall(attackDuration, () => {
                this._attackTimer?.destroy();
                this._attackTimer = null;
                this.setPosition(this.x, CHARACTER.START_Y);
                this.idle();
            })
        })

        this._currentState = CharacterStateType.ATTACK
    }

    idle(): void {
        this.enableInput();;
        this.anims.play(CharacterAnimationKey.IDLE);
        this.setVelocity(0, 0);
        this.flipX = false;

        this._currentState = CharacterStateType.IDLE
    }

    disableInput(): void {
        this._inputController.disable();
    }

    enableInput(): void {
        this._inputController.enable();
    }

    protected _onSetInvulnerability(currentValue: boolean, isDifference: boolean): void {
        if (!isDifference) return;

        if (currentValue) {
            this._healthBar.makeGolden();
        } else {
            this._healthBar.makeRed();
        }
    }

    protected _onTakingDamage(currentHealth: number, isDifference: boolean): void {
        if (this.isInvulnerable) {
            this.setInvulnerability(false);
            return;
        }

        if (!isDifference) return;

        this._healthBar.setHealth(currentHealth);

        this.scene.events.emit(
            GAME_EVENTS.CHARACTER_TOOK_DAMAGE, 
            {
                x: this.x + CHARACTER.FRAME_WIDTH / 2,
                y: this.y + CHARACTER.FRAME_HEIGHT / 2 / this.scale
            }
        )

        this.scene.shakeScreen()

        this.setTintFill(0xFFFFFF);
        this.setAlpha(0.4)
    
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1,
            scaleY: this.scaleY * 1,
            alpha: 0.7,
            duration: 30,
            yoyo: true,
            ease: 'Ease',
            onComplete: () => {
                this.setAlpha(1)
                this.clearTint();
            }
        });

        
        if (!this.isAlive && !this.isDead) {
            this.die();
            return;
        }
    }

    protected _onHealing(currentHealth: number, isDifference: boolean): void {
        if (!isDifference) return;

        this._healthBar.setHealth(currentHealth);
    }

    protected _onDeath(): void {
        this.setVelocity(0, 0)
        this.disableInput();
        this._attackTimer?.destroy();
        this._attackTimer = null;
        this._dashTimer?.destroy();
        this._dashTimer = null;
        this.setDepth(DEPTH_LAYERS.ENTITIES.UNDER);
        this.anims.play(CharacterAnimationKey.DIE);
        this._currentState = CharacterStateType.DEAD;
    }

    protected onUpdate(time: number, delta: number): void {
        this._inputController.update();
        super.onUpdate(time, delta)
    }

    protected onPostUpdate(time: number, delta: number): void {
        super.onPostUpdate(time, delta)
        this._healthBar.setPosition(this.x, this.y)
    }
}