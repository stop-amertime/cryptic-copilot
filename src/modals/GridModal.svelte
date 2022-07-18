<script lang="ts">
import CustomGridEditor from './CustomGridEditor.svelte';
import TemplateGrid from './TemplateGrid.svelte';
import { writable } from 'svelte/store';
import { changeLayout } from '../StateMediator.svelte';
import { getContext } from 'svelte';
/* -------------------------------------------------------------------------- */

const closeModal = () =>
	(document.querySelector('.modal-background') as HTMLElement).click();

let selectedTab = 1;
let defaultLayouts: number[][][] = JSON.parse(
	localStorage.getItem('defaultLayouts')
);

let localCustomLayouts = localStorage.getItem('customLayouts');
let customLayouts: number[][][] = localCustomLayouts
	? JSON.parse(localCustomLayouts)
	: [];

const deleteCustomLayout = (index: number) => {
	let tmp = [];
	customLayouts.forEach((layout, i) => {
		if (i != index) tmp.push(layout);
	});
	customLayouts = tmp;
	localStorage.setItem('customLayouts', JSON.stringify(customLayouts));
};

const changeGrid = (grid: IGridLayout, saveAsCustom: boolean = false) => {
	changeLayout(grid);
	if (saveAsCustom) {
		customLayouts = [...customLayouts, grid];
		localStorage.setItem('customLayouts', JSON.stringify(customLayouts));
	}
	closeModal();
};
</script>

<div class="tabRow">
	<button on:click={() => (selectedTab = 1)} class:select={selectedTab == 1}>
		▦ Templates
	</button>
	<button on:click={() => (selectedTab = 2)} class:select={selectedTab == 2}>
		✎ Customise
	</button>
</div>

<div class="content">
	{#if selectedTab == 1}
		<!--================================= TAB 1 ===============================-->

		<span>Default Layouts</span>
		<div class="gridTemplates">
			{#each defaultLayouts as layout, index}
				<div
					class="grid"
					on:click={() => changeGrid(defaultLayouts[index])}
				>
					<TemplateGrid {layout} />
				</div>
			{/each}
		</div>
		{#key customLayouts}
			<span>Custom Layouts</span>
			<div class="gridTemplates">
				{#each customLayouts as layout, index}
					<div
						class="grid"
						on:click={() => changeGrid(customLayouts[index])}
					>
						<TemplateGrid
							{layout}
							isDeleteable={true}
							on:delete={() => deleteCustomLayout(index)}
						/>
					</div>
				{/each}
				<div class="addLayoutButton" on:click={() => (selectedTab = 2)}>
					<div>+</div>
				</div>
			</div>
		{/key}

		<!--================================= TAB 2 ===============================-->
	{:else}
		<CustomGridEditor
			on:customGrid={e => {
				changeGrid(e.detail, true);
			}}
		/>
	{/if}
</div>

<style lang="scss">
.tabRow {
	display: flex;
	width: 90%;
	justify-content: start;
	margin-bottom: 10px;
	border-bottom: 1px solid black;

	& > button {
		font-size: 1.2em;
		color: grey;
		border-radius: 1px;
		border: none;
		cursor: pointer;
		transition: all 0.1s ease;
		padding: 10px 20px;

		&:not(.select) {
			opacity: 0.6;
			background-color: rgb(255, 255, 255);
		}

		&:active {
			opacity: 0.6;
		}

		&.select {
			color: #000;
			background-color: rgb(235, 235, 235);
		}

		&:hover {
			transition: none;
			outline: 1px solid black;
		}
	}
}

.content {
	display: block;
	width: 800px;
	min-height: 550px;
	max-width: 100%;
	max-height: 100%;

	span {
		font-size: 1.2em;
		padding: 30px 0px;
		height: 40px;
		line-height: 40px;
	}
}

.gridTemplates {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: flex-start;
	width: 100%;
	margin-bottom: 50px;

	.grid,
	.addLayoutButton {
		width: 150px;
		height: 150px;
		cursor: pointer;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		padding: 10px;
		margin: 10px;

		&:hover {
			outline: 1px solid black;
			opacity: 0.8;
		}
	}
}

.addLayoutButton {
	position: relative;
	color: grey;

	> * {
		width: 130px;
		height: 130px;
		outline: 1px solid black;
		font-size: 60px;
		text-align: center;
		line-height: 130px;
		@include centre();
	}
}
</style>
