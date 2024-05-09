<script lang="ts">

    import type { OtterCommand } from "../../game/commands/commands";
    import Tooltip from "../Tooltip.svelte";
    import Emoji from "../Emoji.svelte";
    import { display } from "../../utils/math";
    import { displayOf } from "../../game/utils/modifiers";
    import ModifierText from "../ModifierText.svelte";
    import { cubicInOut, cubicOut, linear, quadOut } from "svelte/easing";
    import { getGame } from "../../game/Game";
    import CommandTooltipResourceCostCount from "./CommandTooltipResourceCostCount.svelte";

    export let command: OtterCommand;

    const fillProgressBar = (node: HTMLSpanElement) => {
        return {
            delay: 0,
            duration: $command.getTotalTime() * 1000,
            easing: linear,
            css: (t: number) => {
                return `width: ${t * 100}%`;
            }
        };
    };

    const drainProgressBar = (node: HTMLSpanElement) => {
        return {
            delay: 0,
            duration: $command.getCooldownTime() * 1000,
            easing: linear,
            css: (t: number) => {
                return `width: ${100 - (t * 100)}%`;
            }
        };
    };

    const fadeOutBar = (node: HTMLSpanElement) => {
        return {
            delay: 0,
            duration: 400,
            css: (t: number) => {
                return `opacity: ${(1 - t) * 100}%`;
            }
        };
    };

    let shaking = false;
    let animationState: "none" | "running" | "cooldown" = "none";
    const onClick = () => {
        if (!command.canRun) return;
        animationState = "running";

        command.run(() => {
            console.log("job done");
            let cooldownTime = command.getCooldownTime();
            if (cooldownTime > 0) {
                animationState = "cooldown";
                if (command.cooldownIsBuff) shaking = true;
                return;
            }
            animationState = "none";
        }, () => {
            animationState = "none";
            shaking = false;
        });
    };


    $: duration = $command.getTotalTime() != 0 ? display($command.getTotalTime()) + "s" : "Instant";
</script>

{#if $command.isVisible}
    <Tooltip title={$command.name} emoji="command">
        <svelte:fragment slot="element">
            <button on:click={onClick}
                    class="text-center h-20 bg-zinc-900 rounded-md border-gray-400 border-2 w-full pt-2 pb-2"
                    class:cant-run={!$command.canRun}>
                <Emoji id="command" color="#D1D5DB" />
                <br>
                {$command.name}
                <span class="flex items-center justify-center pt-1" class:shake={shaking}>
                    <span class="block w-full mr-6 ml-6 h-1 bg-gray-600">
                        {#key animationState}
                            {#if animationState === "running"}
                                <span in:fillProgressBar class="block bg-gray-400 h-full" style="width: 0"></span>
                            {:else if animationState === "cooldown"}
                                <span in:drainProgressBar class="block bg-yellow-400 h-full"
                                      class:bg-green-400={$command.cooldownIsBuff} style="width: 0"></span>
                            {:else}
                                <span in:fadeOutBar class="block bg-green-400 h-full"
                                      style="width: 100%; opacity: 0"></span>
                            {/if}
                        {/key}
                    </span>
                </span>
            </button>
        </svelte:fragment>
        <svelte:fragment slot="tooltip">
            <p>{$command.description}</p>
            <br>
            <p class="text-left">Duration: {duration}</p>
            {#if $command.cost}
                <p class="text-left">Cost: </p>
                <ul>
                    {#each Object.entries($command.cost) as [id, cost]}
                        {@const resource = getGame().Resources.getResourceById(id).get()}
                        <CommandTooltipResourceCostCount {resource} {cost} />
                    {/each}
                </ul>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="shift">
            <p class="pt-1">Speed Modifiers: </p>
            <ModifierText modifierMap={$command.speedModifiers} />
            {#if $command.cooldownModifiers.size !== 0}
                <p class="pt-1">Cooldown Modifiers: </p>
                <ModifierText modifierMap={$command.cooldownModifiers} />
            {/if}
            {#if $command.quantityModifiers}
                <p class="pt-1">Amount Modifiers: </p>
                <ModifierText modifierMap={$command.quantityModifiers} />
            {/if}
        </svelte:fragment>
    </Tooltip>
{/if}


<style>
    button {
        transition: border-color 200ms ease-in-out;
    }

    button:hover :not(.cant-run) {
        border-color: #D1D5DB;
    }

    .cant-run {
        border-color: #e8e885;
    }


    .shake {
        animation: shake 0.5s;
        animation-iteration-count: infinite;
    }

    @media (prefers-reduced-motion) {
        .shake {
            animation: none
        }
    }

    @keyframes shake {
        0% {
            transform: translate(1px, 1px)
        }
        10% {
            transform: translate(-1px, -1px)
        }
        20% {
            transform: translate(-1px, 0px)
        }
        30% {
            transform: translate(1px, 1px)
        }
        40% {
            transform: translate(1px, -1px)
        }
        50% {
            transform: translate(-1px, 1px)
        }
        60% {
            transform: translate(-1px, 1px)
        }
        70% {
            transform: translate(1px, 1px)
        }
        80% {
            transform: translate(-1px, -1px)
        }
        90% {
            transform: translate(1px, 1px)
        }
        100% {
            transform: translate(1px, -1px)
        }
    }
</style>