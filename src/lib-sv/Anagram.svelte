<script lang="ts">
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
import WordPopover from './WordPopover.svelte';
import { WordInfo } from '../lib/ClueEngine';
import { popover } from '../lib/wordPopover';

export let device: IDevice;

function wordScore(node: HTMLButtonElement, { word }) {
	let entry = WordInfo.get(word);
	node.style.background = entry.colour;
	if (entry.isAbbreviation) {
		node.classList.add('abbr');
	}
	node.classList.add('word');
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
</script>

<div class="device">
	{#each device.words as i, index}
		<button
			use:wordScore={{ word: i.word }}
			use:popover={{ component: WordPopover, word: i.word }}
			class="word"
		>
			{i.word}
		</button>

		{#if index < device.words.length - 1} & {/if}
	{/each}
</div>

<style>
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
.device {
	display: flex;
	align-items: stretch;
	height: 40px;
	line-height: 40px;
}

:global(.word) {
	display: inline-block;
	position: relative;
	font-size: 16px;
	font-family: 'Courier New', Courier, monospace;
	margin: 2px 2px;
	border-radius: 2px;
	border: 1px solid gray;
	cursor: pointer;
	overflow: visible;
}

:global(.word:hover) {
	opacity: 0.8;
}

:global(.word.abbr) {
	font-style: italic;
}
</style>
