<script lang="ts">
import { scoreToColour } from '../../lib/DictionaryEngine';
import WordPopover from '../../lib-sv/WordPopover.svelte';
import { popover } from '../../lib/wordPopover';

export let data: IDevice;
</script>

<!----------------------------------------------------------------------HTML--->
<div class="device">
	{#each data.words as i, index}
		<button
			use:popover={{ component: WordPopover, word: i.word }}
			class="word"
			class:abbr={i.abbreviationFor}
			style:background-color={scoreToColour(i?.score)}
		>
			{i.word}
		</button>
	{/each}
</div>

<!----------------------------------------------------------------------CSS----->
<style lang="scss">
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

	@include hoverEffect();
}

.abbr {
	border: 1px solid black;
	text-transform: uppercase;
}
</style>
