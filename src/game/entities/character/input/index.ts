import { IGameScene } from '@/game/scenes/game';
import { Character, CharacterStateType } from '@/game/entities/character';

export interface ICharacterInputController {
    update(): void;
    disable(): void;
    enable(): void;
    destroy(): void;
}

export class CharacterInputController implements ICharacterInputController {
    private character: Character;
    private scene: IGameScene;
    private keys: {
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        up: Phaser.Input.Keyboard.Key;
        a: Phaser.Input.Keyboard.Key;
        d: Phaser.Input.Keyboard.Key;
        w: Phaser.Input.Keyboard.Key;
        shift: Phaser.Input.Keyboard.Key;
        space: Phaser.Input.Keyboard.Key
    } | undefined;
    private _isEnable = true;
    private lastDirection: 'left' | 'right' | undefined;
    private currentDirections = new Set<'left' | 'right'>();
    private dashPerformed = false;

    constructor(scene: IGameScene, character: Character) {
        this.scene = scene;
        this.character = character;
        
        if (!scene.input.keyboard) return;

        this.keys = {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            shift: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };
    }

    update(): void {
        if (!this.keys || !this._isEnable || this.character.isDead || this.character.currentState === CharacterStateType.DEAD) return;
        const { up, w, shift, space } = this.keys;

        this.updateCurrentDirections();

        const dashJustPressed = Phaser.Input.Keyboard.JustDown(shift) || Phaser.Input.Keyboard.JustDown(space);
        const dashKeyDown = shift.isDown || space.isDown;

        if (this.character.currentState === CharacterStateType.WALK) {
            if (dashJustPressed && this.currentDirections.size > 0) {
                const direction = this.currentDirections.values().next().value;
                this.character.dash(direction!);
                this.dashPerformed = true;
                return;
            }
        }

        else if (this.character.currentState === CharacterStateType.IDLE) {
            if (this.currentDirections.size === 0) {
                this.dashPerformed = false;
            } else if (dashKeyDown && !this.dashPerformed) {
                const direction = this.currentDirections.values().next().value;
                this.character.dash(direction!);
                this.dashPerformed = true;
                return;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(up) || Phaser.Input.Keyboard.JustDown(w)) {
            this.character.attack();
            return;
        }

        this.handleMovement();
    }

    private updateCurrentDirections(): void {
        if (!this.keys) return;

        const { left, right, a, d } = this.keys;
        this.currentDirections.clear();

        if (left.isDown || a.isDown) this.currentDirections.add('left');
        if (right.isDown || d.isDown) this.currentDirections.add('right');

        if (this.currentDirections.size === 1) {
            this.lastDirection = this.currentDirections.values().next().value;
        }
    }

    private handleMovement(): void {
        if (this.currentDirections.size === 0) {
            if (this.character.currentState !== CharacterStateType.IDLE) {
                this.character.idle();
            }
            this.lastDirection = undefined;
            return;
        }

        // Если нажато одно направление - двигаемся в него
        if (this.currentDirections.size === 1) {
            const direction = this.currentDirections.values().next().value!;
            this.character.walk(direction);
            this.lastDirection = direction;
            return;
        }

        // Если нажаты оба направления - используем lastDirection
        if (this.lastDirection && this.currentDirections.has(this.lastDirection)) {
            this.character.walk(this.lastDirection);
        }
    }

    disable(): void {
        this._isEnable = false;
        this.currentDirections.clear();
        this.lastDirection = undefined;
        this.dashPerformed = false;
    }

    enable(): void {
        this._isEnable = true;
    }

    destroy(): void {
        if (!this.keys) return;
        Object.values(this.keys).forEach(key => {
            this.scene.input.keyboard?.removeKey(key);
        });
    }
}