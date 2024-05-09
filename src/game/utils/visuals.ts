import type { HTML } from "../../utils/descriptiveTypes";
import type { Game } from "../Game";
import type { ReactiveTrigger } from "../../utils/writableUtils";
import { ticking } from "../ticks";

export type VisualElement = {
    name: string;
    nameLong?: string;
    description: HTML;
    visible?: VisibilityRequirement;
};

export type VisibilityRequirement = (game: Game) => boolean;

export const enableTick = (
    game: Game,
    parent: { isVisible: boolean },
    requirement: VisibilityRequirement,
) => {
    game.Ticker.track(
        ticking(() => {
            parent.isVisible = requirement(game);
        }, 0.05),
    );
};

export const alwaysInvisible = () => false;
export const alwaysVisible = () => true;

export const requiresDiscovery = (resourceId: string) => {
    return (game: Game) =>
        game.Resources.getResourceById(resourceId).get().amountEverObtained > 0;
};
