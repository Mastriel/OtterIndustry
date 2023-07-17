import type {StoredFetchable} from "../utils/writableUtils";
import type {Readable} from "svelte/store";


export interface Updatable {
    getUpdater: () => Readable<this>
}