<script lang="ts">
    import { display } from "../../utils/math.js";
    import { type Resource } from "../../game/resources/resources";

    export let resource: Resource;
    export let cost: number;
</script>


<li class="text-left">{$resource.name}: <span class:text-red-400={$resource.amount < cost}>{display($resource.amount)}
    /{display(cost)}</span></li>