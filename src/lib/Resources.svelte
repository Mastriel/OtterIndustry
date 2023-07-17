<script lang="ts">

    import {Game, getGame} from "../game/Game";
    import {getContext, onMount} from "svelte";
    import type {Resource as GameResource} from "../game/resources/resources";
    import ReactsTo from "./ReactsTo.svelte";
    import Resource from "./Resource.svelte";

    const resources : readonly GameResource[] = getGame().Resources.registeredResources

</script>

<h1 class="text-center mt-4">resources</h1>

<div class="">
    {#each resources as res, i}
        <Resource resource={res}/>
    {/each}
</div>