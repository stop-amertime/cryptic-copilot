<script lang="ts">
import { onMount } from 'svelte';
import { dictionary } from '../StateMediator.svelte';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import RangeSlider from 'svelte-range-slider-pips';
import { writable } from 'svelte/store';

function debounce(func, timeout = 600) {
	let timer;
	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func();
		}, timeout);
	};
}

let tableComponent, table;
let scoreFilters = writable([20, 40]);
let wordLengthFilters = writable([5, 30]);

let array2 = [];
for (let word of $dictionary.entries()) {
	array2.push({
		word: word[0],
		score: word[1].score,
		abbreviationFor: (word[1].abbreviationFor ?? '') + '',
	});
}

scoreFilters.subscribe(() => {
	if (!table) return;
	debounce(setTableFilters)();
});

wordLengthFilters.subscribe(() => {
	if (!table) return;
	debounce(setTableFilters)();
});

const setTableFilters = () => {
	table.clearFilter();
	table.setFilter(function (data) {
		return (
			data.score >= $scoreFilters[0] &&
			data.score <= $scoreFilters[1] &&
			data.word.length >= $wordLengthFilters[0] &&
			data.word.length <= $wordLengthFilters[1]
		);
	});
};

const deleteRows = () => {
	let selectedRows = table.getSelectedRows();
	selectedRows.forEach(row => {
		table.deleteRow(row);
	});
};

onMount(() => {
	table = new Tabulator(tableComponent, {
		data: array2,
		reactiveData: false, //enable data reactivity
		pagination: true,
		layout: 'fitDataStretch',
		columns: [
			{
				title: '',
				formatter: 'rowSelection',
				titleFormatter: 'rowSelection',
				titleFormatterParams: {
					rowRange: 'active', //only toggle the values of the active filtered rows
				},
				hozAlign: 'center',
				headerSort: false,
				width: 10,
			},
			{
				title: 'Word',
				field: 'word',
				sorter: 'string',
				width: 300,
				headerFilter: true,
				editor: 'input',
				formatter: 'plaintext',
				validator: 'regex:[A-Z]+',
				editorParams: {
					search: true,
					elementAttributes: {
						maxlength: '50', //set the maximum character length of the input element to 10 characters
					},
				},
			},
			{
				title: 'Score',
				field: 'score',
				sorter: 'number',
				width: 70,
				validator: 'integer',
				headerFilter: 'number',
				formatter: 'plaintext',
				editor: 'input',
				editorParams: {
					min: 0,
					max: 10,
					step: 1,
					elementAttributes: {
						maxlength: '3', //set the maximum character length of the input element to 10 characters
					},
				},
			},
			{
				title: 'Abbreviation For',
				field: 'abbreviationFor',
				sorter: 'string',
				formatter: 'plaintext',
				editor: 'textarea',
				editorParams: {
					verticalNavigation: 'editor',
				},
				width: 0,
			},
			// {title:"", formatter:"buttonCross", width:40, cellClick:function(e, cell){
			// cell.getRow().delete();
			// }},
		],
	});
});
</script>

<div class="page">
	<h3>Dictionary Editor</h3>
	<div class="controls">
		<div class="filterBox">
			<h3>Filters</h3>
			<p>Word Length</p>
			<RangeSlider
				min={1}
				max={40}
				step={1}
				range
				bind:values={$wordLengthFilters}
				float
			/>
			<p>Score</p>
			<RangeSlider
				min={0}
				max={100}
				bind:values={$scoreFilters}
				step={1}
				range
				float
			/>
		</div>
		<div class="optionBox">
			<button>Add Word</button>
			<button>Delete</button>
			<button>Change Score</button>
		</div>
	</div>

	<div id="table">
		<div id="tablein" bind:this={tableComponent} />
	</div>
</div>
<svelte:head>
	<link
		href="https://unpkg.com/tabulator-tables@4.9.1/dist/css/tabulator.min.css"
		rel="stylesheet"
	/>
</svelte:head>

<style lang="scss">
.page {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 75vh;
	padding: 11px;
	overflow: hidden;
}

:global(.tabulator-row .tabulator-cell a) {
	white-space: pre-wrap;
}

.controls {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;

	.filterBox {
		display: grid;
		grid-template-rows: 30px 40px 40px;
		grid-template-columns: 90px 1fr;
		grid-template-areas:
			'title title'
			'label wordLength'
			'label2 score';
		outline: 1px solid grey;
		margin: 10px 0px;
		padding: 10px;
		width: 60%;

		h3 {
			font-size: 0.8em;
			line-height: 20px;
			margin: 0px;
			grid-area: title;
		}

		p {
			font-size: 0.7em;
		}
	}

	.optionBox {
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		align-items: stretch;

		& > button {
			margin: 10px;
		}
	}
}

#table {
	flex: 1 0 auto;
	width: min(800px, 100vw) !important;

	#tablein {
		height: 100%;
		width: min(800px, 100vw);
	}
}
</style>
