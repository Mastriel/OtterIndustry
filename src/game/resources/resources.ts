import type {
    Fetchable,
    ReactiveTrigger,
    SubscribeFunction,
} from "../../utils/writableUtils";
import { fetchable, reactiveTrigger } from "../../utils/writableUtils";
import type {
    Modifier,
    ModifierMap,
    ReactiveModifierMap,
} from "../utils/modifiers";
import type { Readable } from "svelte/store";
import type { Serializable } from "../utils/serialization";
import type { Ticking } from "../ticks";
import { reactiveModifierMap } from "../utils/modifiers";
import { getGame } from "../Game";
import type { HTML } from "../../utils/descriptiveTypes";
import type { VisibilityRequirement, VisualElement } from "../utils/visuals";
import { alwaysVisible, enableTick } from "../utils/visuals";

export type DataResource = {
    amount: number;
    amountEverObtained: number;
    maxModifiers: { [k: string]: Modifier };
    generationModifiers: { [k: string]: Modifier };
};

const RESOURCE_TICK_TIME = 0.1;

export type ResourceOptions = VisualElement & {
    id: string;
    max: number;
    description: HTML;
    color: string;
    permitsNegativeValues?: boolean;
};

export class Resource
    implements Readable<Resource>, Serializable<DataResource>, Ticking
{
    public readonly name: string;
    public readonly nameLong: string;
    public readonly id: string;
    public readonly description: string;
    public readonly color: string;
    public readonly visibilityRequirement: VisibilityRequirement;
    public readonly permitsNegativeValues: boolean;
    public _isVisible: boolean;
    public get isVisible(): boolean {
        return this._isVisible;
    }

    private set isVisible(value: boolean) {
        if (value != this._isVisible) {
            this._isVisible = value;
            this.updater.trigger();
        }
    }

    public readonly idealInterval = RESOURCE_TICK_TIME;

    public amountEverObtained = 0;

    private _amount: number = 0;
    private _max: number;

    public get baseMax(): number {
        return this._max;
    }

    public maxModifiers: ReactiveModifierMap = reactiveModifierMap();
    public generationModifiers: ReactiveModifierMap = reactiveModifierMap();

    private readonly updater: ReactiveTrigger<this>;
    public readonly subscribe: SubscribeFunction<this>;

    constructor({
        name,
        nameLong,
        id,
        max,
        description,
        color,
        visible = alwaysVisible,
        permitsNegativeValues = false,
    }: ResourceOptions) {
        this.name = name;
        this.nameLong = nameLong ?? name;
        this.id = id;
        this._max = max;
        this.color = color;
        this.description = description;
        this.visibilityRequirement = visible;
        this.permitsNegativeValues = permitsNegativeValues;

        this.updater = reactiveTrigger(this);
        this.subscribe = this.updater.subscribe;
    }

    public ready() {
        //todo remove getGame
        this.isVisible = this.visibilityRequirement(getGame());
        enableTick(getGame(), this, this.visibilityRequirement);
    }

    public readonly generationAmount = (period: number): number => {
        return this.generationModifiers.apply(0) * period;
    };

    public get amount(): number {
        return this._amount;
    }

    public get max(): number {
        return this.maxModifiers.apply(this._max);
    }

    public set amount(value: number) {
        let oldValue = this._amount;
        this._amount = clamp(value, 0, this.max);
        if (oldValue < this._amount) {
            this.amountEverObtained += this._amount - oldValue;
        }
        this.updater.trigger();
    }

    public readonly addUnsafe = (value: number) => {
        this._amount += value;
        this.updater.trigger();
    };

    public readonly restoreFrom = (data: DataResource) => {
        this._amount = data.amount;
        this.amountEverObtained = data.amountEverObtained;
        this.maxModifiers = reactiveModifierMap(
            new Map([
                ...Object.entries(data.maxModifiers),
                ...this.maxModifiers.entries(),
            ]),
        );
        this.generationModifiers = reactiveModifierMap(
            new Map([
                ...Object.entries(data.generationModifiers),
                ...this.generationModifiers.entries(),
            ]),
        );

        this.updater.trigger();
    };

    public readonly serialize = (): DataResource => {
        return {
            amount: this.amount,
            amountEverObtained: this.amountEverObtained,
            maxModifiers: Object.fromEntries(
                this.maxModifiers.getSerializedValues(),
            ),
            generationModifiers: Object.fromEntries(
                this.generationModifiers.getSerializedValues(),
            ),
        };
    };

    public tick = (delta: number) => {
        this.amount += this.generationAmount(delta);
    };
}

const clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);
