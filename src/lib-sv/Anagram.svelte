<script lang="ts">
import { scoreToColour } from '../lib/DictionaryEngine';
import WordPopover from './WordPopover.svelte';
import { popover } from '../lib/wordPopover';

export let device: IDevice;
</script>

<!----------------------------------------------------------------------HTML--->
<div class="device">
	{#each device.words as i, index}
		<button
			use:popover={{ component: WordPopover, word: i.word }}
			class="word"
			class:abbr={i.isAbbreviation}
			style:background-color={scoreToColour(i?.score)}
		>
			{i.word}
		</button>

		{#if index < device.words.length - 1} & {/if}
	{/each}
</div>

<!----------------------------------------------------------------------CSS----->
<style>
.device {
	display: flex;
	align-items: stretch;
	line-height: 80px;
}

.word {
	display: inline-block;
	position: relative;
	font-size: 16px;
	font-family: 'Courier Prime', Courier, monospace;
	margin: 8px 2px;
	border-radius: 2px;
	border: 1px solid gray;
	cursor: pointer;
	overflow: visible;
	text-transform: lowercase;
}

.word:hover {
	opacity: 0.8;
}

.abbr {
	font-style: bolder;
	border: 1px solid black;
	opacity: 0.7;
	text-transform: uppercase;
}
</style>
