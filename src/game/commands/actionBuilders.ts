import type { Game } from "../Game";

export function giveResourceAction(
    game: Game,
    amount: number,
    resourceId: string,
): (game: Game, multi: number) => void {
    if (!game.Resources.getResourceById(resourceId).isOk) {
        console.warn(
            `Resource with id ${resourceId} does not exist (in giveResourceAction)`,
        );
    }

    return (game: Game, multi: number) => {
        let resource = game.Resources.getResourceById(resourceId).get();
        resource.amount += amount * multi;
    };
}
