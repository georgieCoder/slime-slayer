import { IGameScene } from "@/game/scenes/game"
import { Bonus, IBonus, IBonusParams } from "./base"
import { ICharacter } from "@/game/entities/character"
import { HeartBonusTexture, RotateHeartAnimationKey } from "./constants"

export class HealBonus extends Bonus implements IBonus {
    constructor(
        scene: IGameScene, 
        character: ICharacter, 
        params: IBonusParams
    ) {
        super(
            scene, 
            character,
            params,
            HeartBonusTexture,
            RotateHeartAnimationKey
        )
    }

    protected onCollide() {
        if (this.character.isDead) return;
        this.character.heal(1);
        this.deactivate()
    }

}
