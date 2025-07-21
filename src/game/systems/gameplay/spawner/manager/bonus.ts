import { BonusParamsMap, BonusType } from "@/game/entities/bonuses";
import { ISpawnerManager, SpawnerManager } from "./base";
import { BonusSpawner, ISpawner, ISpawnerConfig } from "@/game/systems/gameplay/spawner";
import { IGameScene } from "@/game/scenes/game";
import { ICharacter } from "@/game/entities/character";
import { IBonusParams } from "@/game/entities/bonuses/base";

export class BonusSpawnerManager<const TInitial extends readonly BonusType[]> 
    extends SpawnerManager<BonusType, BonusParamsMap> 
    implements ISpawnerManager<BonusType, BonusParamsMap>
{
    get registeredBonuses(): BonusType[] {
        return this._registeredTypes
    }

    constructor(
        readonly scene: IGameScene,
        readonly character: ICharacter,
        initialTypes?: TInitial,
        configCreator?: (bonusType: TInitial[number]) => ISpawnerConfig,
        paramsCreator?: (bonusType: TInitial[number]) => BonusParamsMap[typeof bonusType],
    ) { 
        super()

        if (!initialTypes || !configCreator || !paramsCreator) return;
        this.registerTypes(initialTypes, paramsCreator, configCreator)
    }

    registerTypes<T extends readonly BonusType[]>(
        bonusTypes: T,
        paramsCreator: (bonusType: T[number]) => IBonusParams,
        configCreator: (bonusType: T[number]) => ISpawnerConfig,
        immediateStart: boolean = false
    ): void {
        this.extend(
            bonusTypes,
            (bonusType) => new BonusSpawner(
                this.scene,
                this.character,
                bonusType,
                configCreator(bonusType),
                () => paramsCreator(bonusType),
            ),
            immediateStart
        )
    }
}