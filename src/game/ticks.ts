import { tick } from "svelte";
import type { Game } from "./Game";

export interface Ticking {
    tick: (delta: number) => void;
    idealInterval?: number;
}

export function ticking(
    run: (delta: number) => void,
    idealInterval: number,
): Ticking {
    return {
        tick: run,
        idealInterval,
    };
}

export interface Ticker {
    track: (ticking: Ticking) => void;
    untrack: (ticking: Ticking) => void;
    forceTick: (length: number) => void;
    timePlayed: number;
}

export const DEFAULT_TICKER_DELTA = 0.05;

export class IntervalTicker implements Ticker {
    protected trackedList: [Ticking, number][] = [];

    public constructor(public game: Game) {
        this._timePlayed = parseFloat(localStorage.getItem("timePlayed"));
        if (isNaN(this._timePlayed)) this._timePlayed = 0;

        this.track(
            ticking((delta) => {
                this._timePlayed += delta;
                localStorage.setItem("timePlayed", this._timePlayed.toString());
            }, 0.1),
        );
    }

    public readonly track = (ticking: Ticking) => {
        let interval = ticking.idealInterval ?? DEFAULT_TICKER_DELTA;
        let intervalId = window.setInterval(
            () => ticking.tick(interval),
            interval * 1000,
        );
        this.trackedList.push([ticking, intervalId]);
    };

    public readonly untrack = (ticking: Ticking) => {
        let trackedObject = this.trackedList.find((it) => it[0] == ticking);
        window.clearInterval(trackedObject[1]);
    };

    public readonly forceTick = (length: number) => {
        for (let [ticking] of this.trackedList) {
            ticking.tick(length);
        }
    };

    private _timePlayed = 0;
    public get timePlayed() {
        return this._timePlayed;
    }
}
