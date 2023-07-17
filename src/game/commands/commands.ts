import {Registry} from "../registry";
import type {ReactiveModifierMap} from "../utils/modifiers";
import type {ReactiveTrigger} from "../../utils/writableUtils";
import {reactiveTrigger} from "../../utils/writableUtils";
import {reactiveModifierMap} from "../utils/modifiers";
import {type Readable, type Subscriber, type Unsubscriber} from "svelte/store"
import type {Game} from "../Game";
import type {HTML} from "../../utils/descriptiveTypes";
import type {VisibilityRequirement, VisualElement} from "../utils/visuals";
import {alwaysVisible, enableTick} from "../utils/visuals";

export class CommandRegistry extends Registry<OtterCommand> {

    constructor(private game : Game) {
        super();
    }

    public registerCommand(options: OtterCommandOptions) : OtterCommand {
        let command = new OtterCommand(options, this.game)
        this.registeredItems.push(command)
        return command
    }
}


type CommandAction = (game: Game, quantityMultiply: number) => void

export type OtterCommandOptions = VisualElement & {
    id: string,
    timeRequired: number,
    startAction?: CommandAction,
    finishAction: CommandAction,
    cooldownFinishAction?: CommandAction,
    cooldownStartAction?: CommandAction,
    concurrent?: boolean,
    hasQuantityModifiers?: boolean,
    cost?: OtterCommandCostMap,
    costScaling?: CostScalingType,
    cooldown?: number,
    cooldownIsBuff?: boolean
}

export type CostScalingType = "none"

export type OtterCommandCostMap = {
    [p: string]: number
}

export class OtterCommand implements Readable<OtterCommand> {
    public readonly id : string
    public readonly timeRequired : number
    public readonly speedModifiers : ReactiveModifierMap
    public readonly cooldownModifiers : ReactiveModifierMap
    public readonly quantityModifiers : ReactiveModifierMap
    public readonly cost? : OtterCommandCostMap
    public readonly costScaling : CostScalingType
    public readonly concurrent : boolean
    public readonly name : string
    public readonly nameLong : string
    public readonly description : HTML
    public readonly visibilityRequirement : VisibilityRequirement
    public readonly cooldown : number

    private _isVisible : boolean
    public get isVisible() { return this._isVisible }
    private set isVisible(value: boolean) {
        if (value != this._isVisible) {
            this._isVisible = value
            this.updater.trigger()
        }
    }

    private _canRun : boolean = true
    public get canRun() { return this._canRun }
    private set canRun(value: boolean) {
        if (value !== this.canRun) {
            this._canRun = value
            this.updater.trigger()
        }
    }

    private updater : ReactiveTrigger<OtterCommand>
    public subscribe : (run: Subscriber<OtterCommand>) => Unsubscriber

    public readonly startAction? : CommandAction
    public readonly finishAction : CommandAction
    public readonly cooldownStartAction? : CommandAction
    public readonly cooldownFinishAction? : CommandAction

    public readonly cooldownIsBuff : boolean

    public start = reactiveTrigger(this)
    public end = reactiveTrigger(this)

    constructor({ id, timeRequired, startAction, finishAction, cooldownIsBuff, cooldownStartAction, cooldownFinishAction, concurrent, visible = alwaysVisible, cooldown, name, nameLong, description, hasQuantityModifiers, costScaling, cost }: OtterCommandOptions, private game: Game) {
        this.timeRequired = timeRequired

        this.name = name
        this.id = id
        this.visibilityRequirement = visible
        this.nameLong = nameLong ?? name
        this.description = description

        this.startAction = startAction
        this.finishAction = finishAction

        this.cooldownStartAction = cooldownStartAction
        this.cooldownFinishAction = cooldownFinishAction

        this.cost = cost
        this.costScaling = costScaling ?? "none"

        this.concurrent = concurrent ?? false

        this.cooldown = cooldown ?? 0
        this.cooldownIsBuff = cooldownIsBuff ?? false

        this.speedModifiers = reactiveModifierMap()

        this.cooldownModifiers = reactiveModifierMap()

        if (hasQuantityModifiers) this.quantityModifiers = reactiveModifierMap()

        this.updater = reactiveTrigger(this)
        this.updater.dependOn(this.start, this.end)
        this.subscribe = this.updater.subscribe


        enableTick(this.game, this, this.visibilityRequirement)

        setInterval(() => this.canRun = this.checkCanRun(), 10)
    }

    public isRunning : boolean = false

    public checkCanRun() : boolean {
        if (this.isRunning && !this.concurrent) return false
        if (this.isOnCooldown) return false
        if (!this.cost) return true
        let entries = Object.entries(this.cost)

        for (let [id, cost] of entries) {
            if (this.game.Resources.getResourceById(id).get().amount < cost) return false
        }
        return true
    }

    public run(after?: () => void, afterCooldown?: () => void) {
        if (!this.concurrent) if (this.isRunning) return;

        let multi = this.quantityModifiers?.apply(1) ?? 1
        this.isRunning = true
        if (this.startAction) this.startAction(this.game, multi)
        setTimeout(() => {
            this.finishAction(this.game, multi)
            this.isRunning = false

            let cooldownTime = this.getCooldownTime()
            console.log()
            if (cooldownTime > 0) {
                this.isOnCooldown = true
                if (this.cooldownStartAction) this.cooldownStartAction(this.game, multi)
                setTimeout(() => {
                    if (this.cooldownFinishAction) this.cooldownFinishAction(this.game, multi)
                    this.isOnCooldown = false
                    if (afterCooldown) afterCooldown()
                }, cooldownTime * 1000)
            }

            if (after) after()
        }, this.getTotalTime() * 1000)
    }

    public isOnCooldown = false


    public getTotalTime = () => {
        return this.speedModifiers.apply(this.timeRequired)
    }

    public getCooldownTime = () => {
        return this.cooldownModifiers.apply(this.cooldown)
    }
}