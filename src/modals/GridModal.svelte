<script lang="ts">
import { writable } from 'svelte/store';

let selectedTab = 1;
let Layouts: number[][][] = JSON.parse(localStorage.getItem('defaultLayouts'));
let customGridSize = writable(15);
let customGrid = new Array(15).fill(new Array(15).fill(1));
let isMirrored = true;
customGridSize.subscribe(
	size =>
		(customGrid = resize(customGrid, size, 1).map(row =>
			resize(row, size, 1)
		))
);

function resize(arr, newSize, defaultValue) {
	return [
		...arr,
		...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue),
	];
}

const customCellClick = (x: number, y: number) => {
	let newgrid = [];
	let len = customGrid.length;
	for (let i = 0; i < len; i++) {
		let newrow = [];
		for (let j = 0; j < len; j++) {
			const same = () => i == x && j == y;
			const mirrored = () => len - 1 == x + i && len - 1 == y + j;
			if (same() || (isMirrored && mirrored())) {
				newrow.push(customGrid[i][j] == 1 ? 0 : 1);
			} else {
				newrow.push(customGrid[i][j]);
			}
		}
		newgrid.push(newrow);
	}
	customGrid = newgrid;
};
const changeGrid = (grid: number) => {
	console.log(grid);
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
		<!-- Tab 1 -->

		<h3>Pick a Grid:</h3>
		<div class="gridTemplates">
			{#each Layouts as layout, index}
				<div class="grid" on:click={() => changeGrid(index)}>
					{#each layout as row}
						<div class="row">
							{#each row as cell}
								<div
									class="cell"
									style:background-color={cell == 0
										? 'black'
										: 'white'}
								/>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<!------- Tab 2 ------->
	{:else}
		<h3>Edit your Grid:</h3>
		<p>Click a cell to change its colour</p>

		<input
			type="number"
			id="gridDimension"
			min="5"
			max="20"
			bind:value={$customGridSize}
		/>

		<input
			type="checkbox"
			bind:checked={isMirrored}
			label="Half-turn Symmetry"
		/>Half-turn Symmetry

		{#key customGridSize}
			<div class="customGrid">
				{#each customGrid as row, i}
					<div class="row">
						{#each row as cell, j}
							<div
								class="cell"
								style:background-color={cell == 0
									? 'black'
									: 'white'}
								on:mousedown={() => customCellClick(i, j)}
							/>
						{/each}
					</div>
				{/each}
			</div>
		{/key}
	{/if}
</div>

<style lang="scss">
.tabRow {
	display: flex;
	width: 80%;
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

.gridTemplates {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	width: 400px;
	height: 300px;

	.grid {
		cursor: pointer;
		aspect-ratio: 1;
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		padding: 10px;
		&:hover {
			outline: 1px solid black;
			opacity: 0.8;
		}
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
}

.customGrid {
	width: 400px;
	height: 400px;
	aspect-ratio: 1;
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
	justify-content: stretch;

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
		cursor: pointer;

		&:hover {
			border-color: green;
		}
	}
}
</style>
