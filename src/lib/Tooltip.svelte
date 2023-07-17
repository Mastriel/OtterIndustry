<script lang="ts">
    import Emoji from "./Emoji.svelte";
    import { type Emoji as EmojiType } from "../utils/emoji"

    export let title : string
    export let emoji : EmojiType

    let hoverElement : HTMLDivElement

    const hover = () => {
        isInvisible = false
    }
    const unhover = () => {
        isInvisible = true
    }

    const mousemove = (ev: MouseEvent) => {
        x = ev.x
        y = ev.y
    }
    const keyEvent = (ev: KeyboardEvent) => { isShifting = ev.shiftKey }
    document.addEventListener("keydown", keyEvent)
    document.addEventListener("keyup", keyEvent)

    let isShifting = false

    let isInvisible = true

    let x = 0
    let y = 100
</script>

<div class="inline-block" on:mouseenter={hover} on:mouseleave={unhover} on:mousemove={mousemove} bind:this={hoverElement}>
    <slot name="element"/>
</div>

<div class:notVisible={isInvisible} class="tooltip absolute bg-gray-950 p-4 border-gray-300 border-2 outline-2 outline outline-gray-950 text-gray-300 text-center z-10"
     class:active={!isInvisible}
     style="left: {x}px; top: {y}px">
    {#if emoji}
        <div class="bg-gray-950 inline-block relative -top-5">
            <Emoji id={emoji} color="#030712" className="absolute -top-0-75"/>
            <Emoji id={emoji} color="#D1D5DB" className="relative -top-1"/>
        </div>
    {/if}
    <h3 class="text-center" class:-mt-5={emoji}>
        {title}
    </h3>
    <hr class="mt-1 mb-2">
    <slot name="tooltip"/>
    {#if $$slots.shift}
        <hr class="mt-1 mb-1">
        {#if isShifting}
            <div class="text-left text-gray-400">
                <slot name="shift"/>
            </div>
        {:else}
            <p>Hold <Emoji id="shift" color="#ccc"/> to view more info.</p>
        {/if}
    {/if}
</div>


<style>
    .notVisible {
        opacity: 0;
    }

    :global(.-top-0-75) {
        top: -1px;
    }

    .tooltip {
        transition: opacity 100ms linear;
        pointer-events: none;
        max-width: 300px;
        line-height: 18px;
    }
</style>