import type { Readable, Subscriber, Unsubscriber } from "svelte/store";
import { fetchable, reactiveTrigger } from "../../utils/writableUtils";
import { display } from "../../utils/math";
import { getGame } from "../Game";
import { ticking } from "../ticks";

export type ModifierOperation = "+" | "-" | "*" | "/" | "^";

/**
 * A modifier for a ModifierMap.
 */
export type Modifier = {
    /** The user-friendly name of this modifier. */
    name: string;
    /** The amount that this modifier operates by */
    amount: number;
    /** The operation this modifier uses. */
    operation: ModifierOperation;
    /** The quantity of this modifier. This is multiplied by [amount] to get the final amount. */
    quantity: number;
    /** The priority of this modifier. Higher numbers go first, lower numbers go last. */
    priority: number;
    /** Controls whether this modifier serializes onto whatever it is applied to. */
    serialize: boolean;
    /** How long this modifier lasts for. */
    duration?: number;
};

export const modifier = (
    name: string,
    amount: number,
    operation: ModifierOperation,
    quantity: number = 1,
    priority: number = 1,
    serialize: boolean = false,
    duration?: number,
): Modifier => {
    return { name, amount, operation, quantity, priority, serialize, duration };
};

export const displayOf = (modifier: Modifier) => {
    switch (modifier.operation) {
        case "+":
            return "+" + display(modifier.amount * modifier.quantity);
        case "-":
            return "-" + display(modifier.amount * modifier.quantity);
        case "*":
            return (
                "+" +
                display((modifier.amount * modifier.quantity - 1) * 100) +
                "%"
            );
        case "/":
            return (
                "-" + display(1 / (modifier.amount * modifier.quantity)) + "%"
            );
        case "^":
            return "^" + display(modifier.amount * modifier.quantity);
    }
};

export type ModifierMap = Map<string, Modifier> & {
    apply: (n: number) => number;
    getSerializedValues: () => [string, Modifier][];
    getSortedArray: () => [string, Modifier][];
};

export const modifierMap = (from?: Map<string, Modifier>): ModifierMap => {
    if (from && from["apply"]) return from as ModifierMap;

    let map = from ?? new Map<string, Modifier>();

    let modifierMap: ModifierMap = Object.assign(map, {
        apply: (n: number): number => {
            let array = Array.from(map.values()).sort(
                (a, b) => b.priority - a.priority,
            );
            for (let modifier of array) {
                switch (modifier.operation) {
                    case "+":
                        n += modifier.amount * modifier.quantity;
                        break;
                    case "-":
                        n -= modifier.amount * modifier.quantity;
                        break;
                    case "*":
                        n *= modifier.amount * modifier.quantity;
                        break;
                    case "/":
                        n /= modifier.amount * modifier.quantity;
                        break;
                    case "^":
                        n **= modifier.amount * modifier.quantity;
                        break;
                    default:
                        console.warn(
                            `Invalid Modifier Operation: ${modifier.operation}`,
                        );
                        break;
                }
            }
            return n;
        },
        getSerializedValues(): [string, Modifier][] {
            return Array.from(map.entries()).filter(
                (it) => it && it[1]?.serialize == true,
            );
        },
        getSortedArray(): [string, Modifier][] {
            return Array.from(map.entries()).sort(
                (a, b) => b[1].priority - a[1].priority,
            );
        },
    });

    startDurationCounters(modifierMap);

    let oldSet = modifierMap.set.bind(modifierMap);
    modifierMap.set = (key: string, value: Modifier): ModifierMap => {
        oldSet(key, value);
        if (value.duration) trackDuration(modifierMap, key, value);
        return modifierMap;
    };

    return modifierMap;
};

const startDurationCounters = (map: ModifierMap) => {
    for (let [key, value] of map.entries()) {
        if (value.duration) trackDuration(map, key, value);
    }
};

const trackDuration = (map: ModifierMap, key: string, value: Modifier) => {
    let tick = ticking((delta: number) => {
        value.duration -= delta;
        if (value.duration <= 0) {
            map.delete(key);
            getGame().Ticker.untrack(tick);
        }
    }, 0.1);
    getGame().Ticker.track(tick);
};

export type ReactiveModifierMap = ModifierMap & Readable<ModifierMap>;

export const reactiveModifierMap = (
    from?: Map<string, Modifier>,
): ReactiveModifierMap => {
    let map = modifierMap(from);

    let update = reactiveTrigger(map);
    let reactiveMap: ReactiveModifierMap = Object.assign(map, update);

    let oldSet = reactiveMap.set.bind(reactiveMap);
    reactiveMap.set = (key: string, value: Modifier): ReactiveModifierMap => {
        oldSet(key, value);
        update.trigger();
        return reactiveMap;
    };

    let oldDelete = reactiveMap.delete.bind(reactiveMap);
    reactiveMap.delete = (key: string): boolean => {
        let result = oldDelete(key);
        update.trigger();
        return result;
    };

    return reactiveMap;
};
