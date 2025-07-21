import { WORLD } from "@/game/constants";
import { SpriteConstructor } from "./types";


export function Collidable<TBase extends SpriteConstructor = SpriteConstructor> (Base: TBase) {
    abstract class CollidableMixin extends Base {
        private _isColliderSetup: boolean = false;
        private _collisions: Map<Phaser.Physics.Arcade.Sprite, Phaser.Physics.Arcade.Collider> = new Map();
        private _isCollisionDisabled = false;

        constructor(...args: any[]) {
            super(...args);

            this.scene.physics.add.existing(this);
        }

        protected setupCollider(bodyWidth: number, bodyHeight: number, makeCircleCollider: boolean = false, alignToBottom: boolean = false): void {
            this.setOrigin(0.5);
    
            if (makeCircleCollider) {
                this.setCircle(bodyWidth / 2)
            } else {
                this.setSize(bodyWidth, bodyHeight);
            }
    
            const offsetX = (this.width - bodyWidth) / 2;
            const offsetY = (this.height - bodyHeight) / 2;
    
            this.setOffset(offsetX, alignToBottom ? offsetY * 2 : offsetY);

            this._isColliderSetup = true;
        }

        protected addCollision(target: Phaser.Physics.Arcade.Sprite, callback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback): void {
            if (!this._isColliderSetup) throw new Error('Прежде чем настраивать коллизию нужно настроить коллайдер с помощью защищенного метода setupCollider');

            this.destroyCollision(target);

            this._collisions.set(
                target, 
                this.scene.physics.add.overlap(
                    this, 
                    target, 
                    (object1, object2) => {
                        if (this._isCollisionDisabled) return;
                        callback(object1, object2)
                    }, 
                    () => {}, 
                    this
                )
            );
        }

        protected destroyCollision(target: Phaser.Physics.Arcade.Sprite): void {
            const oldCollision = this._collisions.get(target);
            oldCollision?.destroy();
        }

        protected destroyAllCollisions(): void {
            Array.from(this._collisions.values()).forEach(collision => collision.destroy());
            this._collisions.clear();
        }

        // выглядит громоздко но зато работает x_x
        protected checkOutOfBounds(options: {
            left?: boolean;
            right?: boolean;
            top?: boolean;
            bottom?: boolean;
        }): boolean {
            const { left: checkLeft, right, top, bottom } = options;
        
            let isOut = false;
        
            if (checkLeft && this.x < -this.width / 2) isOut = true;
            if (right && this.x > Number(WORLD.WIDTH) + this.width / 2) isOut = true;
            if (top && this.y < -this.height / 2) isOut = true;
            if (bottom && this.y > Number(WORLD.HEIGHT) + this.height / 2) isOut = true;
        
            return isOut;
        }

        protected disableCollisions(): void {
            this._isCollisionDisabled = true;
        }

        protected enableCollisions(): void {
            this._isCollisionDisabled = false;
        }
    };

    return CollidableMixin;
}