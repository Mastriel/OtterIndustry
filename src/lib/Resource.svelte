<script lang="ts">

    import type {Resource} from "../game/resources/resources";
    import Resources from "./Resources.svelte";
    import Emoji from "./Emoji.svelte";
    import Tooltip from "./Tooltip.svelte";
    import {displayOf, modifier} from "../game/utils/modifiers";
    import {display} from "../utils/math.js";
    import ModifierText from "./ModifierText.svelte";

    export let resource : Resource


    $: gain = $resource?.generationAmount(1)
    $: gainFormatted = display($resource?.generationAmount(1))

    $: isFull = $resource.amount == $resource.max

    $: maxDisplay = $resource.max == Infinity ? "" : "/" + display($resource.max, 2)
</script>
{#if $resource.isVisible === true}
    <p>
        <Tooltip title={$resource.nameLong} emoji="resource">
            <svelte:fragment slot="element">
                <span style="color: {$resource.color}">{$resource.name}</span>:
                {#if isFull}
                    <span class="text-yellow-200">{display($resource.amount, 2)}{maxDisplay} <Emoji id="warning" color="#fef08a"/></span>
                {:else}
                    <span>{display($resource.amount, 2)}<span class="text-gray-400">{maxDisplay}</span></span>
                {/if}
                {#if gain > 0}
                    <span class="text-cosmic-green">(+{gainFormatted}/s)</span>
                {:else if gain === 0}

                {:else if gain < 0}
                    <span class="text-red-300">({gainFormatted}/s)</span>
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="tooltip">
                <p>{@html $resource.description}</p>
                <br>
                <p class="text-left">Max: {display($resource.max)}</p>
                <p class="text-left">Gain:
                    {#if gain > 0}
                        <span class="text-cosmic-green">+{gainFormatted}/s</span>
                    {:else if gain === 0}
                        <span>+{gainFormatted}/s</span>
                    {:else if gain < 0}
                        <span class="text-red-300">{gainFormatted}/s</span>
                    {/if}
                </p>
                {#if isFull}
                    <p class="text-yellow-200"><Emoji id="warning" color="#FEF08A"/> Full <Emoji id="warning" color="#FEF08A"/></p>
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="shift">
                <p class="pt-1">Generation Modifiers: </p>
                <ModifierText modifierMap={$resource.generationModifiers}/>

                <p class="pt-1">Max Modifiers: </p>
                <ul>
                    <!--suppress JSUnresolvedReference -->
                    <li>Base: {$resource._max}</li>
                    {#each $resource.maxModifiers.getSortedArray() as value}
                        {@const modifier = value[1]}
                        <li>"{modifier.name}": {displayOf(modifier)}</li>
                    {/each}
                </ul>
            </svelte:fragment>
        </Tooltip>
    </p>
{/if}