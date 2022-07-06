<script lang="ts">
import Cell from './Cell.svelte';
import { fly } from 'svelte/transition';
import { cells, activeSlotId } from './StateMediator.svelte';
/* -------------------------------------------------------------------------- */

$: rowsize = Math.sqrt($cells.length) as number;

// A cell is clicked - select the appropriate wordSlot.
function updateSelectedSlot(event: CustomEvent): void {
	let slotIds = event.detail;

	if (slotIds == null || slotIds.length < 1) {
		return;
	}
	if (slotIds.length >= 2) {
		$activeSlotId = $activeSlotId == slotIds[0] ? slotIds[1] : slotIds[0];
	} else if (slotIds.length == 1 && $activeSlotId != slotIds[0]) {
		$activeSlotId = slotIds[0];
	}
}
</script>

<div
	id="GridDiv"
	transition:fly={{ duration: 1000 }}
	style="--dimension:{rowsize}"
>
	{#each $cells as cell}
		<Cell {...cell} on:clicked={updateSelectedSlot} />
	{/each}
</div>

<style>
/* -------------------------------------------------------------------------- */
* {
	box-sizing: border-box;
}
/* @media (min-width: 800px) { */
#GridDiv {
	max-height: 100%;
	max-width: 100%;
	height: 100%;
	aspect-ratio: 1;
	display: grid;
	grid-template-columns: repeat(var(--dimension), 1fr);
	grid-template-rows: repeat(var(--dimension), 1fr);
}

/* @media (max-width: 799px) {

    } */
</style>
