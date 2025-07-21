import { ISpawnerConfig } from "@/game/systems/gameplay/spawner";

interface IInitialStage<
    TType extends string, 
    TParamsMap extends Record<TType, object>
> {
    paramsCreator: (type: TType) => TParamsMap[TType] | undefined,
    configCreator: (type: TType[number]) => ISpawnerConfig | undefined,
    duration: number
}

interface IStage<
    TType extends string, 
    TParamsMap extends Record<TType, object>
> { 
    paramChanges: (type: TType) => Partial<TParamsMap[TType]>,
    configChanges: (type: TType) => Partial<ISpawnerConfig>,
    duration: number
}

export interface IWaveConfig<
    TType extends string, 
    TParamsMap extends Record<TType, object>
> {
    registeredTypes: TType[];
    initialStage: IInitialStage<TType, TParamsMap>,
    stages?: IStage<TType, TParamsMap>[],
    duration: number
}