export const SLIME = {
    FRAME_WIDTH: 80,
    FRAME_HEIGHT: 48,
    BODY_WIDTH: 26,
    BODY_HEIGHT: 22,
    PROJECTILE_BODY_WIDTH: 9,
    PROJECTILE_BODY_HEIGHT: 9,
    HITTING_SLIME_ATTACK_BODY_WIDTH: 80,
    HITTING_SLIME_ATTACK_BODY_HEIGHT: 24,
    SCALE: 2,
    START_Y: -40,
    DUPLICANT_OFFSET_X: 13,
    DUPLICANT_OFFSET_Y: 0,
    DUPLICANT_BODY_WIDTH: 20,
    DUPLIACNT_BODY_HEIGHT: 20
} as const

12
20

export enum SlimeType {
    JUMPING = 'jumping',
    SHOOTING = 'shooting',
    PROJECTILE = 'projectile',
    HIDING = 'hiding',
    HITTING = 'hitting',
    DUPLICATING = 'duplicating',
    DUPLICANT = 'duplicant',
    SIDE_MOVING = 'side_moving',
}

export enum SlimeTexture {
    JUMPING = 'jumping_slime_texture',
    SHOOTING = 'shooting_slime_texture',
    PROJECTILE = 'slime_projectile_texture',
    HIDING = 'hiding_slime_texture',
    HITTING = 'hitting_slime_texture',
    DUPLICATING = 'duplicating_slime_texture',
    DUPLICANT = 'slime_duplicant_texture',
    SIDE_MOVING = 'side_moving_slime_texture'
}

export const SlimeAnimationKey = {
    [SlimeType.JUMPING]: {
        MOVE_DOWN: 'jumping_slime_move_down',
        DIE: 'jumping_slime_die',
        IDLE: 'jumping_slime_idle'
    },
    [SlimeType.SHOOTING]: {
        MOVE_DOWN: 'shooting_slime_move_down',
        DIE: 'shooting_slime_die',
        SHOOT: 'shotting_slime_shoot'
    },
    [SlimeType.PROJECTILE]: {
        FLY: 'slime_projectile_fly'
    },
    [SlimeType.HIDING]: {
        MOVE_DOWN_NORMALLY: 'hiding_slime_move_down_normally',
        MOVE_DOWN_HIDING: 'hiding_slime_move_down_hiding',
        HIDE: 'hiding_slime_hide',
        DIE: 'hiding_slime_die'
    },
    [SlimeType.HITTING]: {
        MOVE_DOWN: 'hittind_slime_move_down',
        DIE: 'hitting_slime_die',
        HIT: 'hitting_slime_hit'
    },
    [SlimeType.DUPLICATING]: {
        MOVE_DOWN: 'duplicating_slime_move_down',
        DUPLICATE: 'duplicating_slime_duplicate'
    },
    [SlimeType.DUPLICANT]: {
        RIGHT_MOVE_DOWN: 'right_slime_duplicant_move_down',
        RIGHT_DIE: 'right_slime_duplicant_die',
        LEFT_MOVE_DOWN: 'left_slime_duplicant_move_down',
        LEFT_DIE: 'left_slime_duplicant_die',
        MOVE_RIGHT: 'slime_duplicant_move_right'
    },
    [SlimeType.SIDE_MOVING]: {
        MOVE_RIGHT: 'side_moving_slime_move_right',
        MOVE_DOWN: 'side_moving_slime_move_down',
        DIE: 'side_moving_slime_die'
    }
} as const