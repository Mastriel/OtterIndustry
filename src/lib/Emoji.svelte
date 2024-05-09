<script lang="ts">
    import type { Emoji } from "../utils/emoji";
    import { emojis } from "../utils/emoji";

    export let id: Emoji;

    export let color: string | undefined = undefined;

    export let className: string = "";

    $: emoji = emojis.get(id);

</script>


{#if color}
    <span
        style="image-rendering: pixelated; --url: url({emoji.url}); height: 15px; width: {emoji.width}px; --color: {color}"
        class="image masked inline-block {className}"></span>
{:else}
    <span style="image-rendering: pixelated; --url: url({emoji.url}); height: 15px; width: {emoji.width}px"
          class="image unmasked inline-block {className}"></span>
{/if}

<style>

    /*noinspection CssUnresolvedCustomProperty*/
    .masked {
        background-color: var(--color);
        mask-image: var(--url);
    }

    .unmasked {
        background-image: var(--url);
    }

    .image {
        padding: 0;
        margin: -3px -3px -3px -2px;
    }
</style>