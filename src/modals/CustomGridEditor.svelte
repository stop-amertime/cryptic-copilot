<script lang="ts">
	import { writable } from "svelte/store";
	import { createEventDispatcher } from "svelte";

	let customGridSize = writable(15);
	let customGrid = new Array(15).fill(new Array(15).fill(1));
	let isMirrored = true;
	let hasClicked = false;
	const dispatch = createEventDispatcher();

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

	const newCustomGrid = (grid: IGridLayout) => dispatch("customGrid", grid);
</script>

<!----------------------------------------------------------------------HTML--->

<div class="component">
	<div class="title">
		<h3>Edit your Grid:</h3>
		<p class="subtitle">Click or drag to toggle each square.</p>
	</div>

	<p class="sizeLabel">Size: {$customGridSize} x</p>
	<input
		type="number"
		id="gridDimension"
		min="5"
		max="20"
		bind:value={$customGridSize}
	/>

	<p class="mirrorLabel">Half-Turn Symmetry</p>
	<label class="switch">
		<input type="checkbox" bind:checked={isMirrored} />
		<span class="slider" />
	</label>

	{#key customGridSize}
		<div class="customGrid">
			{#each customGrid as row, i}
				<div class="row">
					{#each row as cell, j}
						<div
							class="cell"
							style:background-color={cell == 0 ? "black" : "white"}
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
	<button class="saveButton" on:click={() => newCustomGrid(customGrid)}
		><p>🖫</p>
		<p>Save</p></button
	>
</div>

<style lang="scss">
	.component {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 100px 60px 1fr;
		grid-template-rows: 70px 50px 50px 1fr 50px;
		grid-row-gap: 20px;
		grid-column-gap: 20px;
		grid-template-areas:
			"title title title"
			"sizeLabel sizeInput grid"
			"mirrorLabel mirrorToggle grid"
			".  . grid"
			"saveButton  saveButton  grid";
		padding-bottom: 20px;
	}

	.title {
		grid-area: title;
		height: 100%;

		h3 {
			line-height: 0.5;
		}

		.subtitle {
			font-size: 10px;
			color: #666;
			margin-left: 10px;
			font-style: italic;
		}
	}

	.customGrid {
		margin-left: 30px;
		grid-area: grid;
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

	.sizeLabel,
	.mirrorLabel {
		text-align: right;
		height: 50px;
	}
	.sizeLabel {
		grid-area: sizeLabel;
	}

	.mirrorLabel {
		grid-area: mirrorLabel;
		padding: 0px;
		padding-top: 0px;
		line-height: 14px;
		transform: translate(0px, -10px);
	}

	.switch {
		height: 40px;
		position: relative;
		display: inline-block;
		grid-area: mirrorToggle;
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
		content: "";
		height: 30px;
		width: 30px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	:global(input:checked + .slider) {
		background-color: #92ff908f !important;

		&:before {
			-webkit-transform: translateX(20px);
			-ms-transform: translateX(20px);
			transform: translateX(20px);
		}
	}

	:global(input:focus + .slider) {
		box-shadow: 0 0 1px #a3a3a3;
	}

	.saveButton {
		grid-area: saveButton;
		width: 100%;
		display: flex;
		justify-content: flex-start;

		p {
			margin-left: 10px;
			margin-right: 40px;
			font-size: 16px;
			line-height: 100%;
		}
	}
</style>
