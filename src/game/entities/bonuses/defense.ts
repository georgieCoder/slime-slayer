import { IGameScene } from "@/game/scenes/game";
import { Bonus, IBonus, IBonusParams } from "./base";
import { ICharacter } from "../character";
import { RotateStarAnimationKey, StarBonusTexture } from "./constants";

export class DefenseBonus extends Bonus implements IBonus {
    constructor(
        scene: IGameScene, 
        character: ICharacter, 
        params: IBonusParams
    ) {
        super(
            scene, 
            character,
            params,
            StarBonusTexture,
            RotateStarAnimationKey
        )
    }

    protected onCollide() {
        if (this.character.isDead) return;
        this.character.setInvulnerability(true);
        this.deactivate()
    }
}