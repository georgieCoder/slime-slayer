import { CHARACTER, ICharacter } from "@/game/entities/character";
import { IGameScene } from "@/game/scenes/game";
import { IWaveConfig } from "./types";
import { IShootingSlime, ISlimeParams, ISlimeProjectile, ShootingSlime, SlimeParamsMap, SlimeProjectile, SlimeType } from "@/game/entities/slimes";
import { WORLD } from "@/game/constants";
import { RNDUtils } from "@/game/utils";
import { EntityPool, ISpawnerConfig } from "@/game/systems/gameplay/spawner";
import { ISlimeDuplicant, SlimeDuplicant } from "@/game/entities/slimes/duplicant";
import { Math } from "phaser";

const getCenterXByBand = (band: number): number => {
    return band * WORLD.SPAWN_BAND_WIDTH + WORLD.SPAWN_BAND_WIDTH / 2;
}

const getBaseParams = (): ISlimeParams => ({
    speed: Phaser.Math.Between(120, 170),
    x: getCenterXByBand(Phaser.Math.Between(0, 4)),
    y: WORLD.SPAWN_START_Y
})

const createBandPositionGenerator = (packSize: number = 2, bandCount: number = 5) => {
    if (packSize >= bandCount) packSize = bandCount - 1;

    let lastBands: number[] = [];
    let currentPackSize = 0;

    return (): number => {
        currentPackSize++;
        if (currentPackSize > packSize) {
            currentPackSize = 1;
            lastBands = [];
        }

        const newBand = lastBands.length 
            ? RNDUtils.getRandomInRangeExcluding(0, bandCount - 1, lastBands)
            : Phaser.Math.Between(0, bandCount - 1);

        lastBands.push(newBand);
        return getCenterXByBand(newBand);
    };
};

const getJumpingSlimeWave0Stage0PosX = createBandPositionGenerator(2);

const getShootingSlimeWave2InitialStagePosX = createBandPositionGenerator(4);

const getDuplicantSlimeWave2InitialStagePosX: () => number = (() => {
    let i = 0;
    let incrementing = true;
    return () => {
        incrementing ? i++ : i--;

        if (incrementing && i >= WORLD.SPAWN_BAND_COUNT - 1) {
            incrementing = false;
            i = WORLD.SPAWN_BAND_COUNT - 1;
        } else if (!incrementing && i <= 0) {
            incrementing = true;
            i = 0;
        }

        return getCenterXByBand(i);
    }
})()

const getDuplicantSlimeWave2Stage0PosX: () => number = (() => {
    const maxItertions = 7;
    let i = 0;
    let incrementing = false;
     
    return () => {
        i = i > maxItertions ? 0 : i;
        let band;

        if (i === 0) incrementing = false;
        if (i === 6) incrementing = true;

        if (!incrementing) {
            if (i !== 5) band = (i + 1) % 2 === 0 ? 4 - (i - 1) / 2 : i / 2;
            else band = [1, 3][Math.Between(0, 1)]
        } else {
            band = (i + 1) % 2 === 0 ? 10 - i : i - 5;
        }
        i++;
        return getCenterXByBand(band);
    }
})()

const getProjectileWave3Stage0PosX: () => number = (() => {
    let shiftMode = false; // 0 или 1
    let shiftThreshold = 2;
    let i = 0;

    return () => {
        if (i > shiftThreshold) {
            i = 0;
            shiftMode = !shiftMode;
        }

        const band  = Number(shiftMode) + i * 2;
        console.log(band)
        i++;

        return getCenterXByBand(band);
    }
})()

export function getSlimeWaveConfigs(
    scene: IGameScene, 
    character: ICharacter
): IWaveConfig<
        SlimeType, 
        SlimeParamsMap
    >[] {

    const duplicantPool = new EntityPool<SlimeParamsMap[SlimeType.DUPLICANT], ISlimeDuplicant>(
        scene,
        () => new SlimeDuplicant(
            scene, 
            character, 
            {
                speed: 0,
                x: -40,
                y: -40,
                initialMovement: { direction: 'down' }
            }
        ),
        10
    )

    const projectilePool = new EntityPool<SlimeParamsMap[SlimeType.PROJECTILE], ISlimeProjectile>(
        scene,
        () => new SlimeProjectile(
            scene,
            character,
            {
                speed: 0,
                x: -40,
                y: -40
            }
        ),
        10
    )

    return [
        {
            registeredTypes: [SlimeType.JUMPING, SlimeType.DUPLICANT],
            initialStage: {
                configCreator: (type) => {
                    switch (type) {
                        case SlimeType.JUMPING:
                            return {
                                maxOnScreen: 5,
                                firstSpawnDelay: 0,
                                spawnDelay: {min: 1000, max: 2000}
                            }
                        case SlimeType.DUPLICANT:
                            return {
                                maxOnScreen: 5,
                                firstSpawnDelay: 10000,
                                spawnDelay: {min: 800, max: 2000}
                            }
                    }
                },
                paramsCreator: (type) => {
                    switch (type) {
                        case SlimeType.JUMPING:
                            return {
                                ...getBaseParams(),
                                speed: Phaser.Math.Between(230, 270),
                                jumpDelay: Phaser.Math.Between(1200, 1500)
                            } as SlimeParamsMap[SlimeType.JUMPING]
                        case SlimeType.DUPLICANT:
                            return {
                                ...getBaseParams(),
                                initialMovement: {
                                    direction: ['down', 'right'][Phaser.Math.Between(0, 1)],
                                    duration: 0
                                }
                            } as SlimeParamsMap[SlimeType.DUPLICANT]

                    }
                },
                duration: 20000
            },
            stages: [
                {
                    configChanges: (type) => {
                        switch (type) {
                            case SlimeType.JUMPING:
                                return {
                                    spawnDelay: {min: 1500, max: 2500},
                                    maxOnScreen: 10,
                                    spawnSize: 2,
                                    forceSpawnInPack: true
                                }
                            default: return {}
                        }
                    }, 
                    paramChanges: (type) => {
                        switch (type) {
                            case SlimeType.JUMPING:
                                return {
                                    x: getJumpingSlimeWave0Stage0PosX()
                                }
                            default: return {}
                        }
                    },
                    duration: 20000
                }
            ],
            duration: -1
        },
        {
            registeredTypes: [SlimeType.DUPLICATING, SlimeType.HITTING, SlimeType.SIDE_MOVING],
            initialStage: {
                paramsCreator: (type) => {
                    switch (type) {
                        case SlimeType.DUPLICATING:
                            return {
                                ...getBaseParams(),
                                x: getCenterXByBand(Phaser.Math.Between(1, 3)),
                                duplicantPool,
                                duplicationDelay: Phaser.Math.Between(1500, 2000)
                            } as SlimeParamsMap[SlimeType.DUPLICATING]
                        case SlimeType.HITTING:
                            return {
                                ...getBaseParams(),
                                attackYThreshold: Phaser.Math.Between(
                                    CHARACTER.START_Y - CHARACTER.ATTACK_DISTANCE,
                                    CHARACTER.START_Y - CHARACTER.ATTACK_DISTANCE + 40
                                )
                            } as SlimeParamsMap[SlimeType.HITTING]
                        case SlimeType.SIDE_MOVING:
                            return {
                                ...getBaseParams(),
                                sideMovingDelay: { min: 1500, max: 2000 },
                                sideMovingDuration: { min: 500, max: 1000}
                            } as SlimeParamsMap[SlimeType.SIDE_MOVING]
                    }
                },

                configCreator: (type) => {
                    switch (type) {
                        case SlimeType.DUPLICATING:
                            return {
                                maxOnScreen: 5,
                                firstSpawnDelay: 10000,
                                spawnDelay: { min: 3000, max: 4000 }
                            }
                        case SlimeType.HITTING:
                            return {
                                maxOnScreen: 3,
                                firstSpawnDelay: 15000,
                                spawnDelay: { min: 3000, max: 4000 }
                            }
                        case SlimeType.SIDE_MOVING:
                            return {
                                maxOnScreen: 6,
                                firstSpawnDelay: 0,
                                spawnDelay: { min: 1000, max: 1500 }
                            }
                    }
                },
                duration: 30000
            },
            duration: -1
        },
        {
            registeredTypes: [SlimeType.DUPLICANT, SlimeType.SHOOTING],
            initialStage: {
                configCreator: (type) => {
                    switch (type) {
                        case SlimeType.DUPLICANT:
                            return {
                                maxOnScreen: 5,
                                spawnDelay: { min: 1000, max: 1000 },
                                firstSpawnDelay: 0
                            }
                        case SlimeType.SHOOTING:
                            return {
                                maxOnScreen: 5,
                                spawnDelay: { min: 800, max: 1000 },
                                firstSpawnDelay: 1500
                            }
                    }
                },
                paramsCreator: (type) => {
                    switch (type) {
                        case SlimeType.DUPLICANT:
                            return {
                                initialMovement: { 
                                    direction: ['down', 'right'][Phaser.Math.Between(0, 1)],
                                    duration: 0
                                 },
                                speed: 130,
                                x: getDuplicantSlimeWave2InitialStagePosX(),
                                y: WORLD.SPAWN_START_Y
                            } as SlimeParamsMap[SlimeType.DUPLICANT]
                        case SlimeType.SHOOTING:
                            return {
                                ...getBaseParams(),
                                x: getShootingSlimeWave2InitialStagePosX(),
                                shootDelay: Phaser.Math.Between(1000, 1500),
                                projectilePool
                            } as SlimeParamsMap[SlimeType.SHOOTING]
                    }
                },
                duration: 30000
            },
            stages: [
                {   
                    configChanges: (type) => {
                        switch (type) {
                            case SlimeType.DUPLICANT:
                                return {
                                    forceSpawnInPack: true,
                                    spawnSize: 2,
                                    maxOnScreen: 7,
                                    spawnDelay: { min: 1200, max: 1500 }
                                }
                            default: return {}
                        }
                    },
                    paramChanges: (type) => {
                        switch (type) {
                            case SlimeType.DUPLICANT:
                                return {
                                    x: getDuplicantSlimeWave2Stage0PosX()
                                } as Partial<SlimeParamsMap[SlimeType.DUPLICANT]>
                            default: return {}
                        }
                    },
                    duration: 30000,
                }
            ],
            duration: -1
        },
        {   
            registeredTypes: [SlimeType.PROJECTILE, SlimeType.HIDING, SlimeType.JUMPING, SlimeType.SIDE_MOVING],
            initialStage: {
                configCreator: (type) => {
                    switch (type) {
                        case SlimeType.PROJECTILE:
                            return {
                                maxOnScreen: 5,
                                spawnDelay: { min: 1500, max: 2200 },
                                firstSpawnDelay: 0,
                            }
                        case SlimeType.SIDE_MOVING:
                            return {
                                maxOnScreen: 4,
                                spawnDelay: { min: 1800, max: 2400 },
                                firstSpawnDelay: 5000
                            }
                        case SlimeType.JUMPING:
                            return {
                                maxOnScreen: 4,
                                spawnDelay: { min: 2200, max: 2800 },
                                firstSpawnDelay: 10000
                            }
                        case SlimeType.HIDING:
                            return {
                                maxOnScreen: 3,
                                spawnDelay: { min: 1800, max: 2400 }
                            }
                    }
                },
                paramsCreator: (type) => {
                    switch (type) {
                        case SlimeType.PROJECTILE:
                            return {
                                ...getBaseParams(),
                                speed: Math.Between(150, 200)
                            } as SlimeParamsMap[SlimeType.PROJECTILE]
                        case SlimeType.SIDE_MOVING:
                            return {
                                ...getBaseParams(),
                                sideMovingDelay: { min: 1500, max: 2000 },
                                sideMovingDuration: { min: 500, max: 1000}
                            } as SlimeParamsMap[SlimeType.SIDE_MOVING]
                        case SlimeType.JUMPING:
                            return {
                                ...getBaseParams(),
                                speed: Math.Between(230, 270),
                                jumpDelay: Math.Between(1200, 1500)

                            } as SlimeParamsMap[SlimeType.JUMPING]
                        case SlimeType.HIDING:
                            return {
                                ...getBaseParams(),
                                hidingZone: { maxY: WORLD.HEIGHT * 6 / 9, minY: WORLD.HEIGHT * 1 / 4},
                                speedDuringHiding: Math.Between(110, 140)
                            } as SlimeParamsMap[SlimeType.HIDING]
                    }
                },
                duration: 30000
            },
            stages: [
                {
                    configChanges: (type) => {
                        switch (type) {
                            case SlimeType.PROJECTILE:
                                return {
                                    maxOnScreen: 2,
                                    forceSpawnInPack: true,
                                    spawnSize: 3,
                                    spawnDelay: { min: 1500, max: 2500 },
                                }
                            default: return {}
                        }
                    },
                    paramChanges: (type) => {
                        switch (type) {
                            case SlimeType.PROJECTILE:
                                return {
                                    x: getProjectileWave3Stage0PosX(),
                                    behaior: "forward"
                                }
                            default: return {}
                        }
                    },
                    duration: 20000
                }
            ],
            duration: -1
        },
        {
            registeredTypes: [
                SlimeType.DUPLICATING, 
                SlimeType.HIDING, 
                SlimeType.HITTING, 
                SlimeType.JUMPING, 
                SlimeType.SHOOTING, 
                SlimeType.SIDE_MOVING
            ],
            initialStage: {
                configCreator: (type) => {
                    const baseConfig = {
                        maxOnScreen: 2,
                        spawnDelay: {min: 2500, max: 3500}
                    }
                    switch (type) {
                        case SlimeType.DUPLICATING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 0
                            }
                        case SlimeType.JUMPING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 5000
                            }
                        case SlimeType.SIDE_MOVING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 7500
                            }
                        case SlimeType.HITTING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 10000
                            }
                        case SlimeType.SHOOTING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 15000,
                                spawnDelay: { min: 1500, max: 2000 }
                            }
                        case SlimeType.HIDING:
                            return {
                                ...baseConfig,
                                firstSpawnDelay: 17500
                            }
                    }
                },
                paramsCreator: (type) => {
                    switch (type) {
                        case SlimeType.JUMPING:
                            return {
                                ...getBaseParams(),
                                speed: Phaser.Math.Between(230, 270),
                                jumpDelay: Phaser.Math.Between(1200, 1500) 
                            } as SlimeParamsMap[SlimeType.JUMPING]
                        case SlimeType.SIDE_MOVING:
                            return {
                                ...getBaseParams(),
                                sideMovingDelay: { min: 1500, max: 2000 },
                                sideMovingDuration: { min: 500, max: 1000}
                            } as SlimeParamsMap[SlimeType.SIDE_MOVING]
                        case SlimeType.HITTING:
                            return {
                                ...getBaseParams(),
                                attackYThreshold: Phaser.Math.Between(
                                    CHARACTER.START_Y - CHARACTER.ATTACK_DISTANCE,
                                    CHARACTER.START_Y - CHARACTER.ATTACK_DISTANCE + 40
                                )
                            } as SlimeParamsMap[SlimeType.HITTING]
                        case SlimeType.SHOOTING:
                            return {
                                ...getBaseParams(),
                                shootDelay: Phaser.Math.Between(1000, 1500),
                                projectilePool
                            } as SlimeParamsMap[SlimeType.SHOOTING]
                        case SlimeType.HIDING:
                            return {
                                ...getBaseParams(),
                                hidingZone: { maxY: WORLD.HEIGHT * 6 / 9, minY: WORLD.HEIGHT * 1 / 4},
                                speedDuringHiding: Math.Between(110, 140)
                            } as SlimeParamsMap[SlimeType.HIDING]
                        case SlimeType.DUPLICATING:
                            return {
                                ...getBaseParams(),
                                x: getCenterXByBand(Math.Between(1, 3)),
                                duplicantPool,
                                duplicationDelay: Phaser.Math.Between(1500, 2000)
                            } as SlimeParamsMap[SlimeType.DUPLICATING]
                    }
                },
                duration: 40000
            },
            duration: -1
        }
    ]
}