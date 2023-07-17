import {Resource} from "./resources/resources";
import {type IResourceRegistry, ResourceRegistry} from "./resources/resourceRegistry";
import type {Ticker} from "./ticks";
import {IntervalTicker} from "./ticks";
import {CommandRegistry} from "./commands/commands";




export class Game {
    public readonly Resources : IResourceRegistry
    public readonly Ticker : Ticker
    public readonly Commands : CommandRegistry
    constructor() {
        this.Resources = new ResourceRegistry(this)
        this.Ticker = new IntervalTicker(this)
        this.Commands = new CommandRegistry(this)
    }
}


const game = new Game()
export const getGame = () : Game => {
    return game
}