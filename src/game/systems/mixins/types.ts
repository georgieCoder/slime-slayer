import { Entity } from "@/game/entities";

export type Constructor<T = {}> = abstract new (...args: any[]) => T;
export type SpriteConstructor = Constructor<Phaser.Physics.Arcade.Sprite>;
export type EntityConstructor = Constructor<Entity>;