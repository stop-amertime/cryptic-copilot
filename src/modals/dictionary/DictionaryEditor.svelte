<script lang="ts">
	import { fly } from "svelte/transition";
	import { onMount, onDestroy } from "svelte";
	import { dictionary } from "../../StateMediator.svelte";
	import { TabulatorFull as Tabulator } from "tabulator-tables";
	import RangeSlider from "svelte-range-slider-pips";
	import { writable } from "svelte/store";
	import { dictFileStringToMap, downloadMapAsDictFile } from "../../lib/utils";
	/* -------------------------------------------------------------------------- */

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
	let scoreFilters = [40, 80];
	let wordLengthFilters = [1, 30];
	let wordInput = "";
	let scoreInput = 50;
	let scoreAllInput = 50;
	$: wordInput = wordInput.replaceAll(/[^A-z]/g, "");
	let uploadedText;
	let dict = [];
	let selectedRows = [];

	(function initialiseDictionary() {
		for (let word of $dictionary.entries()) {
			dict.push({
				word: word[0],
				score: word[1].score,
				abbreviationFor: (word[1].abbreviationFor ?? "") + "",
			});
		}
	})();

	const setTableFilters = () => {
		if (!table) return;
		table.clearFilter();
		table.setFilter(function (data) {
			return (
				data.score >= scoreFilters[0] &&
				data.score <= scoreFilters[1] &&
				data.word.length >= wordLengthFilters[0] &&
				data.word.length <= wordLengthFilters[1]
			);
		});
	};
	$: scoreFilters, wordLengthFilters, debounce(setTableFilters)();

	const deleteRows = () => {
		let selectedRows = table.getSelectedRows();
		selectedRows.forEach(row => {
			table.deleteRow(row);
		});
	};

	const addNewWord = () => {
		let enteredWord = wordInput.toLocaleUpperCase();
		if (!dict.some(entry => entry.word === enteredWord)) {
			table.addRow(
				{
					word: enteredWord,
					score: scoreInput,
				},
				true
			);
		} else {
			alert(`${enteredWord} is already in the dictionary.`);
		}
	};

	const updateFile = async (f: HTMLInputElement) => {
		uploadedText = f.files.length ? await f.files[0].text() : "";
	};

	const addWordsFromFile = async (
		e: MouseEvent,
		defaultScore = 50,
		overwrite = true
	) => {
		let out = new Map();
		if (!uploadedText) return;
		let map = dictFileStringToMap(uploadedText, defaultScore);

		for (let [key, value] of map) {
			if (!out.has(key) || overwrite) {
				out.set(key, value);
			}
		}
	};

	const downloadDictionaryAsDict = () => {
		downloadMapAsDictFile($dictionary);
	};

	const saveChanges = () => {
		let newDict = new Map();
		table.getData().forEach(row => {
			let [word, score, abbreviationFor] = [
				row.word,
				row.score,
				row.abbreviationFor,
			];
			newDict.set(word, { score, ...(abbreviationFor && { abbreviationFor }) });
		});
		$dictionary = newDict;
		console.log("-- Updated Dictionary");
		console.log($dictionary.get("A"));
	};

	/* ---------------------------------------------- Mount Tabulator With Params */
	onMount(() => {
		table = new Tabulator(tableComponent, {
			data: dict,
			reactiveData: false,
			pagination: true,
			selectable: 1000,
			layout: "fitDataStretch",
			columns: [
				{
					title: "",
					formatter: "rowSelection",
					titleFormatter: "rowSelection",
					titleFormatterParams: {
						rowRange: "active", //only toggle the values of the active filtered rows
					},
					hozAlign: "center",
					headerSort: false,
					width: 10,
				},
				{
					title: "Word",
					field: "word",
					sorter: "string",
					width: 300,
					headerFilter: true,
					editor: "input",
					formatter: "plaintext",
					validator: "regex:/[A-Z]+/",
					editorParams: {
						search: true,
						elementAttributes: {
							maxlength: "50", //set the maximum character length of the input element to 10 characters
						},
					},
				},
				{
					title: "Score",
					field: "score",
					sorter: "number",
					width: 70,
					validator: "integer",
					headerFilter: "number",
					formatter: "plaintext",
					editor: "input",
					editorParams: {
						min: 0,
						max: 10,
						step: 1,
						elementAttributes: {
							maxlength: "3", //set the maximum character length of the input element to 10 characters
						},
					},
				},
				{
					title: "Abbreviation For",
					field: "abbreviationFor",
					sorter: "string",
					formatter: "plaintext",
					editor: "textarea",
					editorParams: {
						verticalNavigation: "editor",
					},
					width: 0,
				},
				// {title:"", formatter:"buttonCross", width:40, cellClick:function(e, cell){
				// cell.getRow().delete();
				// }},
			],
		});

		table.on("rowSelectionChanged", function (data, rows) {
			selectedRows = rows;
			console.log(selectedRows);
		});
	});

	onDestroy(() => {
		saveChanges();
		table.destroy();
	});
</script>

<!----------------------------------------------------------------------HTML--->

<div class="page">
	<div class="controls">
		<div class="optionBox filters">
			<h3>⥸ Filter</h3>
			<p>Length</p>
			<RangeSlider
				min={1}
				max={40}
				step={1}
				range
				bind:values={wordLengthFilters}
				float
			/>
			<p>Score</p>
			<RangeSlider
				min={0}
				max={100}
				bind:values={scoreFilters}
				step={1}
				range
				float
			/>
		</div>
		<div class="optionBox words">
			<h3>+ Add</h3>
			<div class="row">
				<input type="text" bind:value={wordInput} placeholder="Word" />
				<input
					type="number"
					bind:value={scoreInput}
					min="0"
					max="100"
					step="1"
				/>
				<button on:click={addNewWord} disabled={!wordInput.length}>+</button>
			</div>
			<!-- <div class="row">
				<input type="file" on:change={e => updateFile(e.currentTarget)} />
				<button on:click={addWordsFromFile} disabled={!uploadedText}>+</button>
			</div> -->
		</div>
		<div class="optionBox selection" class:collapse={!selectedRows.length}>
			<h3>✔ Selected</h3>
			<button>Delete</button>
			<div class="row">
				<input
					type="number"
					bind:value={scoreAllInput}
					min="0"
					max="100"
					step="1"
				/>
				<button>Set Score</button>
			</div>
		</div>
	</div>

	<div id="table">
		<div id="tablein" bind:this={tableComponent} />
	</div>

	<div class="downloadButton" on:click={downloadDictionaryAsDict}>Discard</div>
	<div class="downloadButton" on:click={downloadDictionaryAsDict}>
		Save Changes
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
		height: 100%;
		padding: 11px;
		overflow: hidden;
	}

	.controls {
		flex: 0.001 0 auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 20px 0px;
		padding: 0px;

		.optionBox {
			position: relative;
			flex: 1 0 200px;
			display: block;
			animation: flex 500ms ease-in-out;
			outline: 1px solid grey;
			padding: 10px;
			height: 100%;
			width: 20%;

			& > * {
				margin: 10px 0px;
				width: 100%;
			}

			&.filters {
				flex: 3 0 300px;
				display: grid;
				grid-gap: 10px;
				grid-template-columns: max-content 1fr;
			}

			&.selection {
				display: block;
				max-width: 150px;
				transition: all 500ms ease-out;
				&.collapse {
					overflow-x: hidden;
					overflow-y: auto;
					max-width: 0px;
					margin: 0px;
					padding: 0px;
					border: none;
					* {
						opacity: 0;
						transition: all 150ms ease-in-out;
					}
				}

				.row {
					display: flex;
					flex-direction: row;
					align-items: stretch;
					justify-content: space-between;
				}
			}

			&.words {
				.row {
					height: 50px;
					padding: 5px 5px;
					border: 1px solid black;
					display: grid;
					grid-template-columns: 1fr 50px 30px;

					& > input {
						width: 100%;
						border: none;
						padding-right: 10px;
					}
				}
			}

			h3 {
				font-size: 0.8em;
				line-height: 20px;
				margin: 0px;
				position: absolute;
				top: -10px;
				left: 5px;
				background-color: white;
				padding: 0px 15px;
				text-align: left;
				height: 20px;
				width: max-content;
			}

			p {
				font-size: 0.7em;
			}
		}
	}

	#table {
		flex: 1 0 auto;
		display: block;
		width: auto;
		margin-bottom: 30px;

		#tablein {
			width: 100%;
			height: 100%;
		}
	}
</style>
