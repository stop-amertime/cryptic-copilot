<script lang="ts">
import { fly } from 'svelte/transition';
export let letters = [];
let mywidth;
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
</script>

<div id="letterBox">
	{#each letters as l}
		{#key l.letter}
			<div
				style="--number: {letters.length}; --size:{mywidth}"
				class="letter {l.isOverwritable ? '' : 'fixed'}"
				bind:clientWidth={mywidth}
			>
				{l.letter}
			</div>
		{/key}
	{/each}
</div>

<style>
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
#letterBox {
	grid-area: 1 / 1 / 2 / 2;
	display: block;
	/* flex-direction: row;
        flex-wrap: nowrap;
        justify-items: center;
        align-items: stretch; */
}

.letter {
	display: inline-block;
	border: 1px solid black;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.205);
	padding: 4px;
	margin: 3px;
	width: 6%;
	aspect-ratio: 1;
	font-size: --mywidth;
	font-weight: 1000;
}

.fixed {
	background-color: grey;
	opacity: 0.7;
}
</style>
