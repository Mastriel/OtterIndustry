import type {Result} from "./utils/result";
import {resultAuto} from "./utils/result";


export class Registry<T extends {id: string}> {

    protected registeredItems : T[] = []

    public register(item: T) {
        this.registeredItems.push(item)
    }

    public getAll() : readonly T[] {
        return this.registeredItems
    }

    public unregister(item: T) {
        this.registeredItems = this.registeredItems.filter(it => it != item)
    }

    public getById(id: string) : Result<T> {
        return resultAuto(this.registeredItems.find(it => it.id == id))
    }
}