import { WORLD } from "@/game/constants";

const HEIGHT = 30;
const SCALE = 2;

export const CHARACTER = {
    SCALE,
    WIDTH: 27,
    HEIGHT,
    START_X: WORLD.WIDTH / 2,
    START_Y: WORLD.HEIGHT - HEIGHT * SCALE / 2 - WORLD.PADDING,
    FRAME_WIDTH: 90,
    FRAME_HEIGHT: 48,
    ATTACK_DISTANCE: 100,
    DASH_DISTANCE: 127,
    WALK_SPEED: 250,
    ATTACK_SPEED: 500,
    DASH_SPEED: 400
} as const

export const CharacterTexture = 'character_texture' as const;

export enum CharacterAnimationKey {
    IDLE = 'character_idle',
    WALK_RIGHT = 'character_walk_right',
    DASH_UP = 'character_dash_up',
    DASH_RIGHT = 'character_dash_right',
    DIE = 'character_die_up'
}

export enum CharacterStateType {
    DASH,
    ATTACK,
    IDLE,
    WALK,
    DEAD
}