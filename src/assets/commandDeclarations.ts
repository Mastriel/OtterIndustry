import {Game, getGame} from "../game/Game";
import {t7e} from "../utils/i18n";
import {modifier} from "../game/utils/modifiers";


let commands = getGame().Commands


export const FindFishSolo = commands.registerCommand({
    id: "find_fish_solo",
    name: t7e("command:find_fish.name"),
    nameLong: t7e("command:find_fish.long_name"),
    description: t7e("command:find_fish.description"),
    timeRequired: 0.2,
    finishAction: (game, multi) => {
        let fish = game.Resources.getResourceById("fish").get()
        fish.amount += multi
    },
    hasQuantityModifiers: true
})

export const GatherWoodSolo = commands.registerCommand({
    id: "gather_wood_solo",
    name: "Gather Wood (Solo)",
    nameLong: "Gather Wood",
    description: "Use your own intuition to venture into the forest and gather wood.",
    timeRequired: 5,
    finishAction: (game, multi) => {
        let fish = game.Resources.getResourceById("wood").get()
        fish.amount += multi
    },
    visible: (game: Game) => {
        let fishObtained = game.Resources.getResourceById("fish").get().amountEverObtained
        return fishObtained >= 10
    },
    hasQuantityModifiers: true,
    cooldown: 2
})

export const EatFish = commands.registerCommand({
    id: "eat_fish",
    name: "Eat Fish",
    nameLong: "Eat Fish",
    description: "Eat fish to get a buff to gathering fish and wood for 30 seconds.",
    timeRequired: 3,
    cooldownStartAction: (game, multi) => {
        console.log(multi)
        let mod = () => modifier("Well Fed", 1.2 * multi, "*", 1, 1, true, EatFish.getCooldownTime())
        FindFishSolo.quantityModifiers.set("well_fed", mod())
        GatherWoodSolo.quantityModifiers.set("well_fed", mod())
    },
    finishAction: (game, multi) => {},
    visible: (game: Game) => {
        let fishObtained = game.Resources.getResourceById("fish").get().amountEverObtained
        return fishObtained >= 25
    },
    cost: {
        "fish": 10
    },
    cooldown: 30,
    cooldownIsBuff: true
})