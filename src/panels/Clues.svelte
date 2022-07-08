<script lang="ts">
/* -------------------------------------------------------------------------- */
import { wordSlots, activeSlotId } from '../StateMediator.svelte';

$: if ($activeSlotId !== null) {
	document.querySelector('.selectedClue')?.classList.remove('selectedClue');
	document
		.getElementById($wordSlots[$activeSlotId]?.clueIndex)
		?.classList.add('selectedClue');
}

const sizeMe = (node, id) => {
	let elem = document.getElementById(id);
	elem.style.height = 'auto';
	elem.style.height = elem.scrollHeight + 'px';
};
const selectMe = event => {
	$activeSlotId = $wordSlots.findIndex(s => s.clueIndex == event.target.id);
};

const resizeMe = event => sizeMe(null, event.target.id);
/* ------------------------------------------------------------------------ */
</script>

<div id="page">
	<div class="column">
		<h3>Across</h3>
		{#each $wordSlots.filter(s => s.orientation == 'A') as slot}
			<div class="clue">
				<p class="label">{slot.number}.</p>

				<textarea
					id={slot.clueIndex}
					contenteditable
					use:sizeMe={slot.clueIndex}
					bind:value={slot.clue}
					on:focus={selectMe}
					on:input={resizeMe}
				/>
			</div>
		{/each}
	</div>

	<div class="column">
		<h3>Down</h3>
		{#each $wordSlots.filter(s => s.orientation == 'D') as slot}
			<div class="clue">
				<p class="label">{slot.number}.</p>

				<textarea
					id={slot.clueIndex}
					contenteditable
					use:sizeMe={slot.clueIndex}
					bind:value={slot.clue}
					on:focus={selectMe}
					on:input={resizeMe}
				/>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
/* -------------------------------------------------------------------------- */

#page {
	padding: 30px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 100%;
	height: 100%;
	@include scroll();
	max-width: 100%;
}

.column {
	flex: 1 0 300px;
	display: block;
	margin-bottom: 30px;
}

.column h3 {
	font-size: 20pt;
	margin: 0px;
	margin-bottom: 20px;
}

.clue {
	//wrapper
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: left;
	padding-left: 30px;
	font-weight: 600;
}

.label {
	flex: 0 0 30px;
	line-height: 0px;
	font-size: 14px;
	padding-top: 5px;
}

textarea {
	border: none;
	flex: 1 0 auto;
	margin-bottom: 15px;
	padding: 10px !important;
	resize: none;
	font-weight: normal;
	padding: 1px;
	transition: all 0.2s fade;
	overflow: hidden;
	max-width: 50ch;
}

:global(.selectedClue) {
	border: 1px solid rgb(64, 150, 64) !important;
	border-radius: 2px;
	outline: none;
}
</style>
