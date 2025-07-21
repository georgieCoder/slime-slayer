import { IBonusParams } from "./base"
import { BonusType } from "./constants"

export type BonusParamsMap = {
    [BonusType.DEFENSE]: IBonusParams,
    [BonusType.HEAL]: IBonusParams,
}