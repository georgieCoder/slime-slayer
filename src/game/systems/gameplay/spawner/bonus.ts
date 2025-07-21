import { BonusParamsMap, BonusType, DefenseBonus, HealBonus } from "@/game/entities/bonuses";
import { IBonus, IBonusParams } from "@/game/entities/bonuses/base";
import { ICharacter } from "@/game/entities/character";
import { IGameScene } from "@/game/scenes/game";
import { ISpawner, ISpawnerConfig, Spawner } from "./base";

export class BonusSpawner<
    TType extends BonusType, 
    TParams extends BonusParamsMap[TType]
> extends Spawner<TParams> implements ISpawner<TParams> {
    constructor(
        scene: IGameScene, 
        character: ICharacter, 
        bonusType: TType, 
        config: ISpawnerConfig, 
        paramsCreator: () => TParams
    ) {
        const createBonus = (
            TargetBonus: new (
                scene: IGameScene, 
                character: ICharacter, 
                params: IBonusParams
            ) => IBonus
        ) => new TargetBonus(scene, character, paramsCreator())

        const bonusCreators: Record<BonusType, () => IBonus> = {
            [BonusType.DEFENSE]: () => createBonus(DefenseBonus),
            [BonusType.HEAL]: () => createBonus(HealBonus)
        }

        super(scene, config, bonusCreators[bonusType], paramsCreator);
    }
}