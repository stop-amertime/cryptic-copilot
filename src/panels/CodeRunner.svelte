<script lang="ts">
import { downloadMapAsDictFile } from './../lib/utils';
import { writable } from 'svelte/store';
import { dictionary, cells, wordSlots } from '../StateMediator.svelte';
import xwordlistScores from '../data/xwordlist.json';

let freqWords = [] as string[];

function run() {
	absorbScores();
}

function absorbScores() {
	let newdict = new Map();

	for (let [word, entry] of $dictionary) {
		newdict.set(word, { ...entry, score: xwordlistScores[word] || entry.score });
	}

	downloadMapAsDictFile(newdict);
}

async function findNoDefinitionWords() {
	let words = [];
	let output = [];

	// Create filtered dictionary (no abbrs, single letters)
	for (let [word, entry] of $dictionary) {
		if (word.length >= 3 && word.length < 5 && !entry.abbreviationFor) {
			words.push(word);
		}
	}

	for (let word of words) {
		let isValid = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word).then(
			r => r.ok
		);

		if (!isValid) output.push(word);
	}
	console.log('INVALID 3&4 LETTER WORDS');
	console.log(output);
}

function findCompoundWords() {
	let filteredWords = [
		'',
		'ED',
		'LY',
		'ES',
		'ABLE',
		'ING',
		'INGS',
		'ER',
		'EST',
		'RE',
		'MIS',
		'UN',
		'DE',
		'ANTI',
		'DIS',
		'ISM',
	];

	let dict = new Map();
	let output: Record<string, string[]> = {};
	let i = 0;

	// Create filtered dictionary (no abbrs, single letters)
	for (let [word, entry] of $dictionary) {
		if (word.length != 1 && !filteredWords.includes(word) && !entry.abbreviationFor) {
			dict.set(word, entry);
		}
	}

	console.time('10 Words');
	for (let [word, entry] of dict) {
		let matches = findCompounds(word);
		if (matches.length) {
			output[word] = matches;
			i++;
			if (i > 10) break;
		}
	}
	console.timeEnd('10 Words');

	console.log(output);

	function findCompounds(inputWord: string, initialWord = inputWord) {
		let matches: string[] = [];

		for (let [word, entry] of dict) {
			if (word == inputWord && word != initialWord) {
				matches.push(inputWord);
			} else if (inputWord.startsWith(word)) {
				let remaining = inputWord.slice(word.length);
				let recursive = findCompounds(remaining, initialWord);

				for (let entry of recursive) {
					matches.push(word + ' ' + entry);
				}
			}
		}
		return matches;
	}
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
