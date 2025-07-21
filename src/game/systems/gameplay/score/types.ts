export enum GAME_EVENTS {
    SLIME_KILLED = 'slime_killed',
    CHARACTER_TOOK_DAMAGE = 'character_took_damage',
    SLIME_PASSED = 'slime_passed',
    PROJECTILE_CAUGHT = 'projectile_caught'
}

export interface ScoreSystemConfig {
    slimeKilled: number;
    projectileCaught: number;
    comboMultiplierStep: number;
    slimePassed: number;
    comboTimeout: number;
}