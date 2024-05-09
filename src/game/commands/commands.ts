import { Registry } from "../registry";
import type { Modifier, ReactiveModifierMap } from "../utils/modifiers";
import type { ReactiveTrigger } from "../../utils/writableUtils";
import { reactiveTrigger } from "../../utils/writableUtils";
import { reactiveModifierMap } from "../utils/modifiers";
import {
    type Readable,
    type Subscriber,
    type Unsubscriber,
} from "svelte/store";
import { type Game, getGame } from "../Game";
import type { HTML } from "../../utils/descriptiveTypes";
import type { VisibilityRequirement, VisualElement } from "../utils/visuals";
import { alwaysVisible, enableTick } from "../utils/visuals";
import type { Emoji } from "../../utils/emoji";
import type { Serializable } from "../utils/serialization";

export class CommandRegistry extends Registry<OtterCommand> {
    constructor(private game: Game) {
        super();
    }

    public registerCommand(options: OtterCommandOptions): OtterCommand {
        let command = new OtterCommand(options, this.game);
        this.registeredItems.push(command);
        return command;
    }

    public registerConstruct() {}
}

type CommandAction = (game: Game, quantityMultiply: number) => void;

export type OtterCommandOptions = VisualElement & {
    /**
     * The ID of the command
     */
    id: string;
    /**
     * The time required to execute the command
     */
    timeRequired: number;
    /**
     * The action that occurs when the command starts
     */
    startAction?: CommandAction;
    /**
     * The action that occurs when the command finishes
     */
    finishAction: CommandAction;
    /**
     * The action that occurs when the command's cooldown starts
     */
    cooldownFinishAction?: CommandAction;
    /**
     * The action that occurs when the command's cooldown finishes
     */
    cooldownStartAction?: CommandAction;
    /**
     * Whether the command can be run multiple times at once.
     */
    concurrent?: boolean;
    /**
     * If the command has quantity modifiers available. (for buildings)
     */
    hasQuantityModifiers?: boolean;
    /**
     * The cost of the command.
     * @see OtterCommandCostMap
     */
    cost?: OtterCommandCostMap;
    /**
     * The type of cost scaling.
     */
    costScaling?: CostScalingType;
    /**
     * The cooldown length of this command, in seconds.
     */
    cooldown?: number;
    /**
     * If the cooldown is a buff. Buffs are simply visually more interesting and rewarding, and probably apply modifiers.
     */
    cooldownIsBuff?: boolean;
};

export type CostScalingType = "none";

/**
 * A mapping of resources to a number. This is used to map out
 * the costs of each resource to run a command.
 */
export type OtterCommandCostMap = {
    [p: string]: number;
};

export type OtterCommandSerialData = {
    speedModifiers: [string, Modifier][];
    cooldownModifiers: [string, Modifier][];
    quantityModifiers: [string, Modifier][] | undefined;
    cooldownStartTime: Date | undefined;
};

export class OtterCommand
    implements Readable<OtterCommand>, Serializable<OtterCommandSerialData>
{
    public readonly id: string;
    public readonly timeRequired: number;
    public readonly cooldown: number;

    public readonly speedModifiers: ReactiveModifierMap;
    public readonly cooldownModifiers: ReactiveModifierMap;
    public readonly quantityModifiers: ReactiveModifierMap | undefined;
    public readonly cooldownStartTime: Date | undefined;

    public readonly cost?: OtterCommandCostMap;
    public readonly costScaling: CostScalingType;
    public readonly concurrent: boolean;
    public readonly name: string;
    public readonly nameLong: string;
    public readonly description: HTML;
    public readonly visibilityRequirement: VisibilityRequirement;

    public readonly emoji: Emoji;

    private _isVisible: boolean;
    public get isVisible() {
        return this._isVisible;
    }

    private set isVisible(value: boolean) {
        if (value != this._isVisible) {
            this._isVisible = value;
            this.updater.trigger();
        }
    }

    private _canRun: boolean = true;
    public get canRun() {
        return this._canRun;
    }

    private set canRun(value: boolean) {
        if (value !== this.canRun) {
            this._canRun = value;
            this.updater.trigger();
        }
    }

    private updater: ReactiveTrigger<OtterCommand>;
    public subscribe: (run: Subscriber<OtterCommand>) => Unsubscriber;

    public readonly startAction?: CommandAction;
    public readonly finishAction: CommandAction;
    public readonly cooldownStartAction?: CommandAction;
    public readonly cooldownFinishAction?: CommandAction;

    public readonly cooldownIsBuff: boolean;

    public start = reactiveTrigger(this);
    public end = reactiveTrigger(this);

    constructor(
        {
            id,
            timeRequired,
            startAction,
            finishAction,
            cooldownIsBuff,
            cooldownStartAction,
            cooldownFinishAction,
            concurrent,
            visible = alwaysVisible,
            cooldown,
            name,
            nameLong,
            description,
            hasQuantityModifiers,
            costScaling,
            cost,
        }: OtterCommandOptions,
        private game: Game,
    ) {
        this.timeRequired = timeRequired;

        this.name = name;
        this.id = id;
        this.visibilityRequirement = visible;
        this.nameLong = nameLong ?? name;
        this.description = description;

        this.startAction = startAction;
        this.finishAction = finishAction;

        this.cooldownStartAction = cooldownStartAction;
        this.cooldownFinishAction = cooldownFinishAction;

        this.cost = cost;
        this.costScaling = costScaling ?? "none";

        this.concurrent = concurrent ?? false;

        this.cooldown = cooldown ?? 0;
        this.cooldownIsBuff = cooldownIsBuff ?? false;

        this.speedModifiers = reactiveModifierMap();
        this.cooldownModifiers = reactiveModifierMap();
        if (hasQuantityModifiers)
            this.quantityModifiers = reactiveModifierMap();
        this.cooldownStartTime = undefined;

        this.updater = reactiveTrigger(this);
        this.updater.dependOn(this.start, this.end);
        this.subscribe = this.updater.subscribe;

        enableTick(this.game, this, this.visibilityRequirement);

        setInterval(() => (this.canRun = this.checkCanRun()), 10);
    }

    public restoreFrom(data: OtterCommandSerialData): void {}
    public serialize(): OtterCommandSerialData {
        return {
            speedModifiers: this.speedModifiers.getSerializedValues(),
            cooldownModifiers: this.cooldownModifiers.getSerializedValues(),
            quantityModifiers: this.quantityModifiers.getSerializedValues(),
            cooldownStartTime: this.cooldownStartTime,
        };
    }

    public isRunning: boolean = false;

    public checkCanRun(): boolean {
        if (this.isRunning && !this.concurrent) return false;
        if (this.isOnCooldown) return false;
        if (!this.cost) return true;
        let entries = Object.entries(this.cost);

        for (let [id, cost] of entries) {
            if (this.game.Resources.getResourceById(id).get().amount < cost)
                return false;
        }
        return true;
    }

    public run(after?: () => void, afterCooldown?: () => void) {
        if (!this.concurrent) if (this.isRunning) return;

        for (const [resourceId, cost] of Object.entries(this.cost ?? {})) {
            const resource = getGame()
                .Resources.getResourceById(resourceId)
                .get();
            resource.amount -= cost;
        }

        let multi = this.quantityModifiers?.apply(1) ?? 1;
        this.isRunning = true;
        if (this.startAction) this.startAction(this.game, multi);
        setTimeout(() => {
            this.finishAction(this.game, multi);
            this.isRunning = false;

            let cooldownTime = this.getCooldownTime();
            console.log();
            if (cooldownTime > 0) {
                this.isOnCooldown = true;
                if (this.cooldownStartAction)
                    this.cooldownStartAction(this.game, multi);
                setTimeout(() => {
                    if (this.cooldownFinishAction)
                        this.cooldownFinishAction(this.game, multi);
                    this.isOnCooldown = false;
                    if (afterCooldown) afterCooldown();
                }, cooldownTime * 1000);
            }

            if (after) after();
        }, this.getTotalTime() * 1000);
    }

    public isOnCooldown = false;

    public getTotalTime = () => {
        return this.speedModifiers.apply(this.timeRequired);
    };

    public getCooldownTime = () => {
        return this.speedModifiers.apply(this.cooldown);
    };
}
