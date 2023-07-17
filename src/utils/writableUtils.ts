import type {Readable, Subscriber, Unsubscriber, Updater, Writable} from "svelte/store";
import {readable, writable} from "svelte/store";


export interface Fetchable<T> extends Writable<T> {
    get: () => T
    trigger: () => void
}

export interface StoredFetchable<T> extends Fetchable<T> {
    name: string
}

/**
 * A store that has a singular initial value that can be claimed as updated when [trigger] is called.
 */
export interface ReactiveTrigger<T> extends Readable<T> {
    trigger: () => void,
    // Causes this trigger to call its subscribers whenever [t] updates.
    dependOn: (...t: Readable<any>[]) => void
}

type Invalidator<T> = (value?: T) => void;

export function reactiveTrigger<T>(value: T) : ReactiveTrigger<T> {
    let store = writable<T>(value)
    let obj : ReactiveTrigger<T> = {
        trigger: () => {
            store.set(value)
        },
        dependOn: (...t: Readable<any>[]) => {
            for (let trigger of t) {
                trigger.subscribe(() => obj.trigger())
            }
        },
        subscribe(run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber {
            return store.subscribe(run, invalidate)
        }
    }
    return obj
}



export function fetchable<T>(value: T | undefined = undefined) : Fetchable<T> {
    let store = writable<T>(value)

    let fetchable = {
        cachedValue: <T | undefined> value,
        set(value: T) {
            fetchable.cachedValue = value
            store.set(value)
        },
        subscribe: store.subscribe,
        update(updater: Updater<T>) {
            let updatedValue = updater(fetchable.cachedValue)
            fetchable.cachedValue = updatedValue
            store.set(updatedValue)
        },
        get: () => {
            return fetchable.cachedValue
        },
        trigger() {
            store.set(this)
        }
    }
    return fetchable
}



export function storedFetchable<T>(name: string, value: T | undefined = undefined) : StoredFetchable<T> {
    let store = fetchable<T>(value)

    let storedFetchable = {
        ...store,
        name,
        cachedValue: <T | undefined> value,
        set(value: T) {
            store.set(value)
            window.localStorage.setItem(name, JSON.stringify(value));
        },
        update(updater: Updater<T>) {
            store.update(updater)
            window.localStorage.setItem(name, JSON.stringify(store.get()))
        }
    }

    let storedItem = window.localStorage.getItem(name)
    if (storedItem) {
        storedFetchable.set(JSON.parse(storedItem))
    }

    return storedFetchable
}


export type SubscribeFunction<T> = (run: Subscriber<T>) => Unsubscriber

