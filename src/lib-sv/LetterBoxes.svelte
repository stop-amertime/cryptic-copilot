<script lang="ts">
import { fly } from 'svelte/transition';

export let letters = [] as ICellState[];

let wrapperWidth, wrapperHeight;
$: maxBoxWidth = wrapperWidth / letters.length;
$: maxBoxHeight = wrapperHeight;
$: boxDimension = Math.min(maxBoxWidth, maxBoxHeight) + 'px';
</script>

<!----------------------------------------------------------------------HTML--->

<div
	id="letterBox"
	bind:clientWidth={wrapperWidth}
	bind:clientHeight={wrapperHeight}
>
	{#each letters as l}
		{#key l.letter}
			<div
				style:--size={boxDimension}
				class="letter"
				class:fixed={l.isOverwritable}
			>
				<span>{l.letter}</span>
			</div>
		{/key}
	{/each}
</div>

<!----------------------------------------------------------------------CSS----->
<style lang="scss">
#letterBox {
	grid-area: 1 / 1 / 2 / 2;
	display: block;
}

.letter {
	float: left;
	height: var(--size);
	width: var(--size);
	max-width: calc(var(--size) - 1px);
	font-size: calc(var(--size) * 0.7);
	line-height: calc(var(--size));
	text-align: center;
	font-weight: bold;
	border: 1px solid black;
	margin-right: -1px;
	z-index: 1;

	span {
		margin: 0px;
		padding: 0px;
	}

	&:not(.fixed) {
		background-color: rgb(219, 219, 219);
		color: rgb(109, 109, 109);
		border-style: dashed;
	}
}
</style>
