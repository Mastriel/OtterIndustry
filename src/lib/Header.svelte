<script lang="ts">


    import {getGame} from "../game/Game";
    import Emoji from "./Emoji.svelte";
    import {onMount} from "svelte";
    import moment from "moment";

    let game = getGame()

    const resetData = () => {
        localStorage.setItem = () => {
            console.log("local storage disabled due to a data wipe")
        }
        localStorage.clear()
        window.location.reload()
    }

    let dateDisplay : string = ""

    onMount(() => {
        updateTime()
        setInterval(updateTime, 1000)
    })
    const updateTime = () => {
        let time = moment()
        dateDisplay = `${time.format("MMMM Do, h:mm:ssA")}`
    }
</script>


<header class="pl-2 pr-2 h-6 bg-background flex justify-between border-b">
    <div>
        <div class="float-left">
            <p class="border-r pr-4">Otter Industry v0.1</p>
        </div>
        <div class="float-left">
            <p class="pl-3 border-r pr-4">developed by <a href="https://mastriel.github.io" target="_blank">mastriel <Emoji id="flower" color="#c1ffce"/></a></p>
        </div>

    </div>
    <div>
        <div class="float-right">
            <p class="pl-3 border-l pr-2 text-gray-300">{dateDisplay}</p>
        </div>
        <div class="float-right">
            <p on:click={resetData} class="pl-3 border-l pr-4 text-red-200 clickable">Reset <Emoji id="reset" color="#fecaca"/></p>
        </div>
    </div>

</header>