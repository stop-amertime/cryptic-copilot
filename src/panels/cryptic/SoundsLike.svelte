<script lang="ts">
	import WordPopover from "../../lib-components/WordPopover.svelte";
	import { popover } from "../../lib/wordPopover";
	import { scoreToColour } from "../../lib/DictionaryEngine";
	export let list: IWord[] = [];
</script>

<div class="page">
	{#each list as word}
		<div
			class="word"
			use:popover={{ component: WordPopover, word: word.word }}
			style:background-color={scoreToColour(word.score * 15)}
		>
			{word.word}
		</div>
	{/each}
</div>

<style lang="scss">
	.page {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.word {
			display: inline-block;
			position: relative;
			font-size: 16px;
			font-family: "Courier Prime", Courier, monospace;
			margin: 8px 2px;
			border-radius: 2px;
			border: 1px solid gray;
			cursor: pointer;
			overflow: visible;
			text-transform: lowercase;

			@include hoverEffect();
		}
	}
</style>
