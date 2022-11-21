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
}

.word {
	display: inline-block;
	position: relative;
	font-size: 14px;
	font-family: 'Courier Prime', Courier, monospace;
	font-weight: normal;
	margin: 12px 3px;
	padding: 1px 10px;
	border-radius: 2px;
	border: 1px solid rgb(193, 193, 193);
	cursor: pointer;
	text-transform: lowercase;
	background-color: var(--color);

	@include hoverEffect();
}

.abbr {
	text-transform: uppercase;
}
</style>
