<script lang="ts">
import { createEventDispatcher } from 'svelte';
export let layout: IGridLayout;
export let isDeleteable = false;
let showDeleteButton = false;
const dispatch = createEventDispatcher();

const deleteMe = (event: MouseEvent) => {
	event.stopImmediatePropagation();
	dispatch('delete');
};

const hoverDeleteButton = (node: HTMLElement) => {
	node.addEventListener('mouseenter', () => {
		showDeleteButton = true;
	});
	node.addEventListener('mouseleave', () => {
		showDeleteButton = false;
	});
};
</script>

<div class="wrapper" use:hoverDeleteButton>
	{#if isDeleteable}
		<div
			class="deleteButton"
			hidden={!showDeleteButton}
			on:click={deleteMe}
		>
			🗑
		</div>
	{/if}
	{#each layout as row}
		<div class="row">
			{#each row as cell}
				<div
					class="cell"
					style:background-color={cell == 0 ? 'black' : 'white'}
				/>
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
.wrapper {
	@include size(100%);
	position: relative;
}

.deleteButton {
	position: absolute;
	top: -15px;
	right: -15px;
	width: 30px;
	height: 30px;
	border-radius: 2px;
	background-color: hueToColour(0, 1);
	color: black;
	border: 1px solid black;
	font-style: bolder;
	font-size: 30px;
	text-align: center;
	line-height: 30px;

	@include hoverScale(1.2);
	transition: all 0.2s ease-in-out;
}

.row {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: stretch;
	align-items: stretch;
	width: 100%;
}

.cell {
	flex: 1 1 auto;
	border: 1px solid black;
}
</style>
