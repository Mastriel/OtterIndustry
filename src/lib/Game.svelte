<script lang="ts">

    import Resources from "./Resources.svelte";
    import { setContext } from "svelte";
    import { getGame } from "../game/Game";
    import CommandCenter from "./commands/CommandCenter.svelte";

    setContext("game", getGame());
</script>


<div class="flex justify-center">
    <div class="w-full mr-20 ml-20 mt-20 gap-8 grid grid-game justify-between" style="height: 80vh">
        <div class="h-full">
            <Resources />
        </div>
        <div class="flex justify-between flex-col gap-8" style="flex-grow: 1">
            <div style="flex-grow: 2">
                <CommandCenter />
            </div>
            <div style="flex-grow: 1"></div>
        </div>
    </div>
</div>


<style>
    .grid-game {
        grid-template-columns: 0.6fr 1fr;
    }
</style>