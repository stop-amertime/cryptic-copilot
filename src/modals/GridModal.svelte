<script lang="ts">
import { writable } from 'svelte/store';

let selectedTab = 1;
let Layouts: number[][][] = JSON.parse(localStorage.getItem('defaultLayouts'));
let customGridSize = writable(15);
let customGrid = new Array(15).fill(new Array(15).fill(1));
let isMirrored = true;
let hasClicked = false;
customGridSize.subscribe(
	size =>
		(customGrid = resize(customGrid, size, []).map(row =>
			resize(row, size, 1)
		))
);

function resize(
	arr: any[],
	newSize: number,
	defaultValue: number | any[]
): any[] {
	if (newSize > arr.length) {
		return [
			...arr,
			...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue),
		];
	} else {
		return arr.slice(0, newSize);
	}
}

const customCellClick = (event: MouseEvent, x: number, y: number) => {
	if (event && (event.buttons !== 1 || hasClicked)) {
		return;
	}
	hasClicked = true;
	let newgrid = [];
	let len = customGrid.length;
	for (let i = 0; i < len; i++) {
		let newrow = [];
		for (let j = 0; j < len; j++) {
			const same = () => i == x && j == y;
			const mirrored = () => len - 1 == x + i && len - 1 == y + j;
			if (same() || (isMirrored && mirrored())) {
				newrow.push(customGrid[x][y] == 1 ? 0 : 1);
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
		<!--================================= TAB 1 ===============================-->

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

		<!--================================= TAB 2 ===============================-->
	{:else}
		<h3>Edit your Grid:</h3>
		<p>Click a cell to change its colour</p>

		<div class="row">
			<input
				type="number"
				id="gridDimension"
				min="5"
				max="20"
				bind:value={$customGridSize}
			/>
			<p>x {$customGridSize}</p>
		</div>
		<div class="row">
			<pre>Half-Turn Symmetry    </pre>
			<label class="switch">
				<input type="checkbox" bind:checked={isMirrored} />
				<span class="slider" />
			</label>
		</div>
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
								on:mousemove={e => customCellClick(e, i, j)}
								on:click={() => customCellClick(null, i, j)}
								on:mouseout={e => (hasClicked = false)}
								on:blur={e => (hasClicked = false)}
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

.content {
	display: block;
	width: 60vw;
	height: 60vh;

	& > .row {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: stretch;
		margin-bottom: 10px;
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

.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	-webkit-transition: 0.4s;
	transition: 0.4s;
}

.slider:before {
	position: absolute;
	content: '';
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	-webkit-transition: 0.4s;
	transition: 0.4s;
}

:global(input:checked + .slider) {
	background-color: #ffffff;

	&:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}
}

:global(input:focus + .slider) {
	box-shadow: 0 0 1px #a3a3a3;
}
</style>
