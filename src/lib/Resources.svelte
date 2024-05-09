<script lang="ts">

    import { Game, getGame } from "../game/Game";
    import { getContext, onMount } from "svelte";
    import type { Resource as GameResource } from "../game/resources/resources";
    import ReactsTo from "./ReactsTo.svelte";
    import Resource from "./Resource.svelte";

    const resources: readonly GameResource[] = getGame().Resources.registeredResources;

</script>

<div class="bg-[#0004] px-4 pb-4">
    <h1 class="text-center mt-4 w-full">resources</h1>

    <div>
        {#each resources as res, i}
            <Resource resource={res} />
        {/each}
    </div>
</div>
