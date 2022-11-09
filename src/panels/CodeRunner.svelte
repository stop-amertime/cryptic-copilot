<script lang="ts">
import { writable } from 'svelte/store';
import { dictionary, cells, wordSlots } from '../StateMediator.svelte';
import { gbWords } from '../data/miscdata/gberg-1freqwords.js';

let freqWords = gbWords as string[];

function run() {
	gridToTxt();
}

function addFrequencyScores() {
	let newWords = [];

	let minScore = 40;
	let maxScore = 80;

	for (let i = 0; i < freqWords.length; i++) {
		let newScore = ~~(((freqWords.length - i) / freqWords.length) * 10) + 60;
		let word = freqWords[i];

		// if (!$dictionary.has(word)) {
		// 	$dictionary = $dictionary.set(word, { score: newScore });
		// } else {
		// 	let prev = $dictionary.get(word);
		// 	$dictionary = $dictionary.set(word, { ...prev, score: newScore });
		// }
		newWords.push({ word, obj: { score: newScore } });
	}
	console.table(newWords);
	for (let i = 0; i < newWords.length; i++) {
		Object.assign(newWords[i].obj, {
			abbreviationFor: $dictionary.get(newWords[i].word)?.abbreviationFor,
		});

		if (i < 10) {
			console.log(
				newWords[i].word + '\n is: ' + JSON.stringify($dictionary.get(newWords[i].word))
			);
			console.log(newWords[i].word + ' -> ' + JSON.stringify(newWords[i].obj));
		}

		$dictionary.set(newWords[i].word, newWords[i].obj);
	}
}

function gridToTxt() {
	const enum sym {
		'filled' = '#',
		'empty' = ' ',
		'col' = '|',
		'row' = '-',
		'cross' = '+',
	}

	// N x N grid
	let N = Math.round(Math.sqrt($cells.length));

	// Each N having M x M subgrid
	let M = 5;

	// N ROWS, N 'COLUMNS'

	let output = '';

	for (let i = 0; i < $cells.length; i++) {
		if (i % N == 0) {
			output += '|\n' + new Array(N).fill('-').join('') + '\n';
		}

		output += '|' + ($cells[i].isValid ? 'O' : '#');
	}

	console.log('GRID:' + output);
}
</script>

<button on:click={() => run()}>-- RUN CODE --</button>

<style>
button {
	background-color: red;
	color: white;
}
</style>
