<script lang="ts">
    import type { ReactiveModifierMap } from "../game/utils/modifiers.js";
    import { displayOf } from "../game/utils/modifiers";

    export let modifierMap: ReactiveModifierMap;

    export let displayNone: boolean = true;

</script>

<ul>
    {#each $modifierMap.getSortedArray() as value}
        {@const modifier = value[1]}
        <li>"{modifier.name}": {displayOf(modifier)}</li>
    {:else}
        {#if displayNone}
            <li>None</li>
        {/if}
    {/each}
</ul>