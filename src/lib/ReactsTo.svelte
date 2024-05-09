<script lang="ts">
    import { type Readable } from "svelte/store";

    export let trigger: Readable<any>;

    let index = false;

    trigger?.subscribe(() => index = !index);
</script>