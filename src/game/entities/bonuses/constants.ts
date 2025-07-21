export const StarBonusTexture = 'star_bonus_texture' as const
export const RotateStarAnimationKey = 'star_bonus_rotate' as const

export const HeartBonusTexture = 'heart_bonus_texture' as const
export const RotateHeartAnimationKey = 'heart_bonus_rotate' as const

export const BONUS = {
    FRAME_WIDTH: 80,
    FRAME_HEIGHT: 48,
    BODY_WIDTH: 15,
    BODY_HEIGHT: 15,
    SCALE: 2,
    SPEED: 200
} as const

export enum BonusType {
    DEFENSE = 'defense',
    HEAL = 'heal'
}