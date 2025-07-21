import { SlimeParamsMap, SlimeType } from "@/game/entities/slimes";
import { ISpawnerManager, SpawnerManager } from "./base"
import { IGameScene } from "@/game/scenes/game";
import { ICharacter } from "@/game/entities/character";
import { ISpawnerConfig, SlimeSpawner } from "@/game/systems/gameplay/spawner";


export class SlimeSpawnerManager<const TInitial extends readonly SlimeType[]> 
    extends SpawnerManager<SlimeType, SlimeParamsMap> 
    implements ISpawnerManager<SlimeType, SlimeParamsMap>
{
    constructor(
        readonly scene: IGameScene,
        readonly character: ICharacter,
        initialTypes?: TInitial,
        configCreator?: (slimeType: TInitial[number]) => ISpawnerConfig,
        paramsCreator?: (slimeType: TInitial[number]) => SlimeParamsMap[TInitial[number]]
    ) {
        super();
        
        if (!initialTypes || !configCreator || !paramsCreator) return;
        this.registerTypes(initialTypes, paramsCreator, configCreator);
    }

    get registeredSlimes(): SlimeType[] {
        return this._registeredTypes;
    }

    registerTypes<T extends readonly SlimeType[]>(
        slimeTypes: T,
        paramsCreator: (slimeType: T[number]) => SlimeParamsMap[T[number]],
        configCreator: (slimeType: T[number]) => ISpawnerConfig,
        immediateStart: boolean = false
    ): void {
        this.extend(
            slimeTypes,
            (type) => new SlimeSpawner(
                this.scene,
                this.character,
                type,
                configCreator(type),
                () => paramsCreator(type)
            ),
            immediateStart
        );
    }
}