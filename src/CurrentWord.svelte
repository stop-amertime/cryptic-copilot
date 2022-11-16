<script lang="ts">
import { writable } from 'svelte/store';
import { activeSlotId, wordSlots } from './StateMediator.svelte';

$: disabled = $activeSlotId === null;

const removeNewlines = () => {
	let elem = document.querySelector('textarea.cluetext') as HTMLInputElement;
	elem.value = elem.value.replaceAll(/\r?\n|\r/g, '');
};
</script>

<div class="currentclue">
	{#if !disabled}
		<div class="wrapper">
			<h2>{$wordSlots[$activeSlotId].clueIndex + '.'}</h2>
			<textarea
				class="cluetext"
				wrap="hard"
				rows="3"
				placeholder="Enter clue... ({$wordSlots[$activeSlotId].cells.length})"
				bind:value={$wordSlots[$activeSlotId].clue}
				on:input={() => removeNewlines()}
			/>
			<!-- <div class="length">({$wordSlots[$activeSlotId].cells.length})</div> -->
		</div>
	{/if}
</div>

<style lang="scss">
@import './style.scss';

.currentclue {
	width: 100%;
	max-width: 100%;
	margin: 40px 0px;

	.wrapper {
		width: 100%;
		max-width: 100%;
		height: max-content;
		max-height: 100%;
		display: flex;
		flex-direction: row;

		h2 {
			line-height: 24px;
			color: gray;
			flex: 0 0 auto;
			margin-top: 0px;
			padding-top: 0px;
			font-size: 20px;
			font-weight: bold;
		}

		.cluetext {
			flex: 1 1 auto;
			font-size: 16px;
			margin: 0px 20px;
			outline: none;
			border: none;
			word-wrap: break-word;
			cursor: text;
			resize: none;
			overflow-x: hidden;
			max-width: 80%;
		}

		// .length {
		// 	align-self: flex-end;
		// 	flex: 3 0 auto;
		// 	color: gray;
		// }
	}
}
</style>
