<script lang="ts">

    import { getGame } from "../../game/Game";
    import CommandButton from "./CommandButton.svelte";

    let commands = getGame().Commands.getAll();

    console.log(commands);
</script>


<h1 class="text-center mt-4">commands</h1>

<div class="command-grid">
    {#each commands as command}
        <CommandButton command={command} />
    {/each}
</div>


<style>
    .command-grid {
        @apply gap-4 mt-4 grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
</style>