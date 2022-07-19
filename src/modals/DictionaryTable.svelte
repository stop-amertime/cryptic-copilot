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
		height: '100%',
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
			},
			{
				title: 'Word',
				field: 'word',
				width: 400,
				sorter: 'string',
				headerFilter: true,
				editor: 'input',
				formatter: 'plaintext',
				validator: 'regex:[A-Z]*',
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
				validator: 'integer',
				headerFilter: 'number',
				formatter: 'plaintext',
				width: 100,
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
				width: 30,
				sorter: 'string',
				editor: 'textarea',
				editorParams: {
					verticalNavigation: 'editor',
				},
			},
			// {title:"", formatter:"buttonCross", width:40, cellClick:function(e, cell){
			// cell.getRow().delete();
			// }},
		],
	});
});
</script>

<h3>Word Length</h3>
<RangeSlider
	min={1}
	max={40}
	step={1}
	range
	bind:values={$wordLengthFilters}
	float
/>
<h3>Score</h3>
<RangeSlider
	min={0}
	max={100}
	bind:values={$scoreFilters}
	step={1}
	range
	float
/>

<div id="table">
	<div id="tablein" bind:this={tableComponent} />
</div>
<svelte:head>
	<link
		href="https://unpkg.com/tabulator-tables@4.9.1/dist/css/tabulator.min.css"
		rel="stylesheet"
	/>
</svelte:head>

<style>
#table {
	height: 500px;
	width: 100%;
}

#tablein {
	overflow-y: scroll;
}
</style>
