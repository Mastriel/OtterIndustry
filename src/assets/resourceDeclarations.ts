import {t7e} from "../utils/i18n";
import {modifier} from "../game/utils/modifiers";
import {Game, getGame} from "../game/Game";
import {alwaysInvisible, alwaysVisible, requiresDiscovery} from "../game/utils/visuals";

let resources = getGame().Resources


export const Fish =resources.registerResource({
    id: "fish",
    name: t7e("resource:fish.name"),
    description: t7e("resource:fish.description"),
    color: "#ffbebe",
    max: 3000,
    visible: alwaysVisible
})

export const Wood = resources.registerResource({
    id: "wood",
    name: t7e("resource:wood.name"),
    description: t7e("resource:wood.description"),
    color: "#bd7868",
    max: 50,
    visible: requiresDiscovery("wood")
})

resources.getResourceById("fish").get()
    .subscribe((it) => {
        if (it.amount < 100) {
            it.generationModifiers.set("desperation", modifier("Desperation", 1.2, "*", 1, -1))
        } else {
            it.generationModifiers.delete("desperation")
        }
    })

export const Aluminium = resources.registerResource({
    id: "aluminium",
    name: t7e("resource:aluminium.name"),
    description: t7e("resource:aluminium.description"),
    color: "#befff5",
    max: 200,
    visible: requiresDiscovery("aluminium")
})

export const SoulsOfTheInnocent = resources.registerResource({
    id: "souls_of_the_innocent",
    name: t7e("resource:souls_of_the_innocent.name"),
    nameLong: t7e("resource:souls_of_the_innocent.long_name"),
    description: t7e("resource:souls_of_the_innocent.description"),
    color: "#ff2e3e",
    max: 1,
    visible: alwaysInvisible
}).generationModifiers.set("entropy", modifier("Entropy", 0.001, "+", 1, 1))

