import { SlimeType } from "./constants"
import { ISlimeDuplicantParams } from "./duplicant"
import { IDuplicatingSlimeParams } from "./duplicating"
import { IHidingSlimeParams } from "./hiding"
import { IHittingSlimeParams } from "./hitting"
import { IJumpingSlimeParams } from "./jumping"
import { ISlimeProjectileParams } from "./projectile"
import { IShootingSlimeParams } from "./shooting"
import { ISideMovingSlimeParams } from "./sideMoving"

export type SlimeParamsMap = {
    [SlimeType.JUMPING]: IJumpingSlimeParams,
    [SlimeType.SHOOTING]: IShootingSlimeParams,
    [SlimeType.PROJECTILE]: ISlimeProjectileParams,
    [SlimeType.HIDING]: IHidingSlimeParams,
    [SlimeType.HITTING]: IHittingSlimeParams,
    [SlimeType.DUPLICANT]: ISlimeDuplicantParams,
    [SlimeType.DUPLICATING]: IDuplicatingSlimeParams,
    [SlimeType.SIDE_MOVING]: ISideMovingSlimeParams
}