import { ICharacter } from "@/game/entities/character";
import { IGameScene } from "@/game/scenes/game";
import { ISpawner, ISpawnerConfig, Spawner } from "./base";
import { HidingSlime, ISlime, JumpingSlime, ShootingSlime, SlimeParamsMap, SlimeProjectile, SlimeType } from "@/game/entities/slimes";
import { HittingSlime } from "@/game/entities/slimes/hitting";
import { SlimeDuplicant } from "@/game/entities/slimes/duplicant";
import { DuplicatingSlime } from "@/game/entities/slimes/duplicating";
import { SideMovingSlime } from "@/game/entities/slimes/sideMoving";

const SlimeClassesMap: {
    [TType in SlimeType]: new(
        scene: IGameScene,
        character: ICharacter,
        params: SlimeParamsMap[TType]
    ) => ISlime< SlimeParamsMap[TType], TType >
} = {
    [SlimeType.JUMPING]: JumpingSlime,
    [SlimeType.SHOOTING]: ShootingSlime,
    [SlimeType.PROJECTILE]: SlimeProjectile,
    [SlimeType.HIDING]: HidingSlime,
    [SlimeType.HITTING]: HittingSlime,
    [SlimeType.DUPLICANT]: SlimeDuplicant,
    [SlimeType.DUPLICATING]: DuplicatingSlime,
    [SlimeType.SIDE_MOVING]: SideMovingSlime
}


export class SlimeSpawner<TType extends SlimeType, TParams extends SlimeParamsMap[TType]> extends Spawner<TParams> implements ISpawner<TParams> {
    constructor(
        scene: IGameScene,
        character: ICharacter,
        slimeType: TType,
        config: ISpawnerConfig,
        paramsCreator: () => TParams
    ) {
        const SlimeClass = SlimeClassesMap[slimeType];
        super(
            scene, 
            config, 
            () => new SlimeClass(scene, character, paramsCreator()), 
            paramsCreator
        );
    }
}