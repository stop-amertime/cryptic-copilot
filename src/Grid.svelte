<script lang="ts">
	import Cell from "./Cell.svelte";
	
	import { fly } from "svelte/transition";
	import { activeSlotId } from "./StateMediator.svelte";
	import CurrentWord from "./CurrentWord.svelte";
	/* -------------------------------------------------------------------------- */

	export let cells: ICell[];
	$: rowsize = Math.sqrt(cells.length);
	let gridSize: number;

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

<div id="Grid">
	<div
		id="GridDiv"
		bind:offsetWidth={gridSize}
		transition:fly={{ duration: 1000 }}
		style="--dimension:{rowsize}"
	>
		{#each cells as cell}
			<Cell {...cell} on:clicked={updateSelectedSlot} />
		{/each}
	</div>

	<CurrentWord />
</div>

<style lang="scss">
	/* -------------------------------------------------------------------------- */
	* {
		box-sizing: border-box;
	}
	@media (max-width: 1000px) {
		#Grid {
			width: 100%;
			align-items: center;
			justify-content: stretch;
		}
	}

	#Grid {
		width: 500px;
		height: 500px;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;

		#GridDiv {
			max-height: 500px;
			max-width: 500px;
			aspect-ratio: 1;
			display: grid;
			grid-template-columns: repeat(var(--dimension), 1fr);
			grid-template-rows: repeat(var(--dimension), 1fr);
			position: relative;
		}
	}

	/* @media (max-width: 799px) {

    } */
</style>
