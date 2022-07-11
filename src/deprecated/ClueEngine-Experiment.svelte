<script context="module" lang="ts">
import { dictionary } from '../StateMediator.svelte';

type IWordHashMap = Map<number, string[]>;
const enum WordDirection {
	Forward = 'forward',
	Reverse = 'reverse',
	Anagram = 'anagram',
}

// Lists
let DICTIONARY: IDictionary = new Map();
let HashMapping = new Map() as IWordHashMap;
let HashList: number[] = [];

// Filters
let MIN_WORD_LENGTH: number = 15;
let MIN_WORD_SCORE: number = 45;
let MAX_ANAGRAM_WORDS: number = 4;

let TARGET_WORD: string = '';

export const initialise = (dictionary: IDictionary): void => {
	DICTIONARY = dictionary;
	createHashMapping();
};

export const updateWordFilters = (
	length: number,
	score: number,
	maxWords: number
): void => {
	MIN_WORD_LENGTH = length || MIN_WORD_LENGTH;
	MIN_WORD_SCORE = score || MIN_WORD_SCORE;
	MAX_ANAGRAM_WORDS = maxWords || MAX_ANAGRAM_WORDS;
};

/* ------------------------------------------------------------------ Hashing */

const hashTable: Record<string, number> = {
	E: 2,
	A: 3,
	R: 5,
	I: 7,
	O: 11,
	T: 13,
	N: 17,
	S: 19,
	L: 23,
	C: 29,
	U: 31,
	D: 37,
	P: 41,
	M: 43,
	H: 47,
	G: 53,
	B: 59,
	F: 61,
	Y: 67,
	W: 71,
	K: 73,
	V: 79,
	X: 83,
	Z: 89,
	J: 97,
	Q: 101,
};

const letterMap = new Map(Object.entries(hashTable));

const getHash = (word: string): number => {
	return DICTIONARY.get(word)?.hash || hash(word);
};

function hash(word: string): number {
	let hash = 1;
	for (let char of word) {
		hash *= hashTable[char];
	}
	return hash;
}

function createHashMapping(): void {
	HashMapping = new Map();
	HashList = [];

	let temp = new Map() as Map<number, Set<string>>;
	for (let [key, value] of DICTIONARY) {
		if (key.length < 15 && value.score > 46) {
			let previous = temp.get(value.hash);
			if (previous) {
				temp.set(value.hash, previous.add(key));
			} else {
				temp.set(value.hash, new Set([key]));
			}
		}
	}
	for (let entry of temp) {
		HashMapping.set(entry[0], [...entry[1]]);
		HashList.push(entry[0]);
	}
	HashList.sort((a, b) => b - a);
}

/* -------------------------------------------------------------- Strings Etc */

function findDirection(subword: string, baseword: string): WordDirection {
	/**
	 * Find the direction of a subword in a base word.
	 *
	 * Find whether subword is forward, backward or jumbled in the base word. For use in devices like containers, charades.
	 *
	 * @param {string} subword  the inner/edge word.
	 * @param {string} baseword  the containing word.
	 * @return {WordDirection} enum for the direction - Forward, Reverse, Anagram
	 */

	switch (baseword) {
		case subword:
			return WordDirection.Forward;
		case [...subword].reverse().join(''):
			return WordDirection.Reverse;
		default:
			return WordDirection.Anagram;
	}
}

function toGridWord(word: string) {
	return word.toUpperCase().replace(/[^A-Z]/, '');
}

function getLeftoverLetters(array1: string | string[], subword: string) {
	let array2 = Array.from(subword) as string[];
	if (typeof array1 == 'string') {
		array1 = Array.from(array1);
	}
	array2 = array2.splice(0);
	return array1.filter((v: string, i: number, a: any) => {
		let index = array2.indexOf(v);
		if (index > -1) {
			array2.splice(index, 1);
			return false;
		}
		return !array2.includes(v);
	});
}

/* :::::::::::::::::::::::::::::::::: MAIN :::::::::::::::::::::::::::::::::: */

/* ----------------------------------------------------- OLD Generation Steps */
function OLD_generateDevices(targetword: string) {
	console.time('OLD: Crawl Anagram Tree');
	let uncategorisedAnagrams: string[][] = OLD_crawlAnagramTree(
		targetword,
		DICTIONARY
	);
	console.timeEnd('OLD: Crawl Anagram Tree');

	//SHOW ME THE BROKEN ONES
	console.table(
		uncategorisedAnagrams.filter(
			a => a.join('').length != targetword.length
		)
	);

	let devices = OLD_categoriseAsDevices(uncategorisedAnagrams, targetword); //Categorise
	return devices as IDeviceSet;
}

function OLD_crawlAnagramTree(
	inputword: string,
	searchList: Map<any, any> = DICTIONARY
) {
	let inputhash = getHash(inputword);
	let mycompleteanagrams = [];
	let mypartialanagrams = [];

	// The crazy magic happens.
	for (let [key, value] of searchList) {
		if (value.hash == inputhash) {
			mycompleteanagrams.push([key]);
		} else if (inputhash % value.hash == 0) {
			mypartialanagrams.push([key, { hash: value.hash }]);
		}
	}

	//let mysearcharray = [...(wordArraytoHashMap(mypartialanagrams))];

	// For partial anagrams, run function recursively on remaining letters.
	// Forward search only - create searchlist based on words further forward in the list.
	let searchLength = inputword.length >> 1;

	for (let i = 0; i < mypartialanagrams.length; i++) {
		let pa = mypartialanagrams[i][0];
		let forwardSearchMap = new Map(mypartialanagrams.slice(i));

		if (pa.length < searchLength) {
			continue;
		}
		let remainingWord = getLeftoverLetters(inputword, pa).join('');
		let anagramsofremainingword = OLD_crawlAnagramTree(
			remainingWord,
			forwardSearchMap
		);
		if (anagramsofremainingword == null) {
			continue;
		}

		for (let pair of anagramsofremainingword) {
			//REMOVE THIS LOOP TO "HEIRARCHICALISE"
			let accumulated = [pa, pair].flat(1); //FLATTENER
			mycompleteanagrams.push(accumulated);
		}
	}

	if (mycompleteanagrams.length == 0) {
		return null;
	}
	return mycompleteanagrams;
}

function OLD_isDevice(
	origWord: string,
	subWordArray: any[],
	depth = 0
): Array<IWord> {
	let inputWord = origWord;

	// TRIVIAL CASE - SINGLE WORD
	if (
		subWordArray.length == 1 &&
		subWordArray[0].length == inputWord.length
	) {
		return [
			{
				word: subWordArray[0],
				direction: findDirection(subWordArray[0], inputWord),
			} as IWord,
		];
	}

	// MULTIPLE WORDS - RECURSIVELY BUILD AS CHARADE/CONTAINER
	for (let i = 0; i < subWordArray.length; i++) {
		let subword = subWordArray[i];

		let charade = isCharade(subWordArray[i], inputWord);
		if (charade == 'start') {
			let matched: string,
				leftovers = '';
			[matched, leftovers] = [
				inputWord.slice(0, subword.length),
				inputWord.slice(subword.length),
			];
			subWordArray.splice(i, 1);
			i = -1;
			let recursive = OLD_isDevice(leftovers, subWordArray, depth);
			if (recursive != null) {
				return [
					{
						...stringToIWord(subword),
						direction: findDirection(subword, matched),
					},
					...recursive,
				];
			}
		} else if (charade == 'end') {
			//if (trivialEndings.includes(subWordArray[i])) {continue;} //throw away if 'trivial' word ending.

			let subword = subWordArray[i];

			let matched = inputWord.slice(-1 * subword.length);
			let leftovers = inputWord.slice(
				0,
				inputWord.length - subword.length
			);

			subWordArray.splice(i, 1);
			let recursive = OLD_isDevice(leftovers, subWordArray, depth);
			if (recursive != null) {
				return [
					...recursive,
					{
						...stringToIWord(subword),
						direction: findDirection(subword, matched),
					},
				];
			}
		} else if (depth == 0) {
			//Try a container IF not already in a container (avoid double nesting)
			let cont = isContainer(subword, inputWord);
			if (cont != null) {
				let matched: string,
					leftovers = '';
				[matched, leftovers] = cont;
				subWordArray.splice(i, 1);
				let recursive = OLD_isDevice(leftovers, subWordArray, 1);
				if (recursive != null) {
					return [
						{
							...stringToIWord(subword),
							direction: findDirection(subword, matched),
							contains: recursive,
						} as IWord,
					];
				}
			}
		}
	}

	//NO MATCHES OF ANY KIND: RETURN NULL.
	return null;

	function isCharade(subword: string, baseword: string) {
		switch ([...subword].sort().join('')) {
			case [...baseword.substring(0, subword.length)].sort().join(''):
				return 'start';
			case [...baseword.substring(baseword.length - subword.length)]
				.sort()
				.join(''):
				return 'end';
			default:
				return null;
		}
	}

	function isContainer(subword: string, baseword: string) {
		if (subword.length < 2) {
			return null;
		}

		let sorted = [...subword].sort().join('');
		let lengthdiff = baseword.length - subword.length;
		if (lengthdiff == 0) {
			return null;
		} //just in case

		for (let i = 1; i + lengthdiff < baseword.length; i++) {
			let middleremoved =
				baseword.slice(0, i) + baseword.slice(i + lengthdiff);

			if ([...middleremoved].sort().join('') == sorted) {
				return [middleremoved, baseword.slice(i, i + lengthdiff)];
			}
		}
		return null;
	}
}

function OLD_categoriseAsDevices(
	anagramList: string[][],
	targetword: string
): IDeviceSet {
	let containers = [] as IDevice[];
	let anagrams = [] as IDevice[];

	for (let anagramSet of anagramList) {
		if (anagramSet.join('').length != targetword.length) {
			continue;
		}

		let device = OLD_isDevice(targetword, anagramSet);

		if (!device) {
			//Filter out incomplete partials...
			let anagramDevice = anagramSet.map((s: any) => {
				return { word: s } as IWord;
			}) as Array<IWord>;
			anagrams.push({ words: anagramDevice } as IDevice);
		} else {
			containers.push({ words: device } as IDevice);
		}
	}

	return { anagrams, containers } as IDeviceSet;
}

/* ----------------------------------------------------- NEW Generation Steps */

const unhash = (hash: number): string[] => {
	return HashMapping?.get(hash) || hashToStrings(hash);
};

const hashToStrings = (hash: number): string[] => {
	let string = '';
	for (let [key, value] of letterMap) {
		while (hash % value == 0) {
			string += key;
			hash /= value;
		}
	}
	return [string];
};

const stringToIWord = (word: string): IWord => {
	return { word, ...DICTIONARY.get(word) };
};

function cartesianProductOfArrays(arrayOfWordArrays: string[][]): string[][] {
	let cartesianProduct = [];
	for (let i = 0; i < arrayOfWordArrays.length; i++) {
		let currentArray = arrayOfWordArrays[i];
		if (cartesianProduct.length === 0) {
			cartesianProduct = currentArray;
		} else {
			cartesianProduct = cartesianProduct.map(item => {
				return currentArray.map(item2 => [item, item2].flat());
			});
			cartesianProduct = [].concat(...cartesianProduct);
		}
	}
	return cartesianProduct;
}

/* ::::::::::::::::::::::::::::: MAIN FUNCTIONS ::::::::::::::::::::::::::::: */

function monad(input: any) {
	let myMonad = {
		value: input,
		chain: (fn: (input: any) => any) => {
			if (!(input && input.length))
				console.log('Length at step: ', fn.name, ' is: ', input.length);
			return monad(fn(input));
		},
	};
	return myMonad;
}

export function getDevices(word: string): IDeviceSet {
	TARGET_WORD = word;
	return monad(word)
		.chain(findValidHashCombinations)
		.chain(inflateHashCombinations)
		.chain(categoriseWordArraysAsDevices).value;
}

function findValidHashCombinations(
	input: string | number,
	maxdepth: number = MAX_ANAGRAM_WORDS
): number[][] {
	let inputHash = typeof input == 'number' ? input : hash(input);
	let factorList = [];
	for (let i = 0; i < HashList.length; i++) {
		if (inputHash % HashList[i] == 0) {
			factorList.push(HashList[i]);
		}
	}

	let listlen = factorList.length;
	return crawlTree(inputHash);

	function crawlTree(
		inputHash: number,
		start: number = 0,
		depth: number = 0
	) {
		if (depth > maxdepth) {
			return [];
		}
		let returnarray: number[][] = [];

		for (let i = start; i < listlen; i++) {
			let iter: number = factorList[i] as number;
			if (inputHash % iter == 0) {
				let remaining: number = inputHash / iter;
				let indexOfRemaining: number = factorList.findIndex(
					x => x <= remaining
				);
				if (factorList[indexOfRemaining] == remaining) {
					let validCombination = [iter, remaining]; //inline
					returnarray.push(validCombination);
				} else if (indexOfRemaining == -1) {
					continue;
				}
				let subcombos = crawlTree(
					remaining,
					indexOfRemaining,
					depth + 1
				);
				for (let combo of subcombos) {
					returnarray.push([iter, ...combo]);
				}
			}
		}
		return returnarray;
	}
}

function inflateHashCombinations(hashArrays: number[][]): string[][] {
	let output = [] as string[][];
	for (let hashArray of hashArrays) {
		let arrayOfWordArrays: string[][] = hashArray.map(n => unhash(n));
		let cartesianProduct = cartesianProductOfArrays(arrayOfWordArrays);
		output.push(...cartesianProduct);
	}
	return output;
}

function isDevice(
	targetWord: string,
	subWordArray: any[],
	depth = 0
): Array<IWord> {
	// TRIVIAL CASE - SINGLE WORD
	if (
		subWordArray.length == 1 &&
		subWordArray[0].length == targetWord.length
	) {
		return [
			{
				...stringToIWord(subWordArray[0]),
				direction: findDirection(subWordArray[0], targetWord),
			} as IWord,
		];
	}

	// MULTIPLE WORDS - RECURSIVELY BUILD AS CHARADE/CONTAINER
	for (let i = 0; i < subWordArray.length; i++) {
		let subword = subWordArray[i];

		let charade = isCharade(subWordArray[i], targetWord);
		if (charade == 'start') {
			let matched: string,
				leftovers = '';
			[matched, leftovers] = [
				targetWord.slice(0, subword.length),
				targetWord.slice(subword.length),
			];
			subWordArray.splice(i, 1);
			i = -1;
			let recursive = isDevice(leftovers, subWordArray, depth);
			if (recursive) {
				return [
					{
						...stringToIWord(subword),
						direction: findDirection(subword, matched),
					},
					...recursive,
				];
			}
		} else if (charade == 'end') {
			//if (trivialEndings.includes(subWordArray[i])) {continue;} //throw away if 'trivial' word ending.

			let subword = subWordArray[i];

			let matched = targetWord.slice(-1 * subword.length);
			let leftovers = targetWord.slice(
				0,
				targetWord.length - subword.length
			);

			subWordArray.splice(i, 1);
			let recursive = isDevice(leftovers, subWordArray, depth);
			if (recursive != null) {
				return [
					...recursive,
					{
						...stringToIWord(subword),
						direction: findDirection(subword, matched),
					},
				];
			}
		} else if (depth == 0) {
			//Try a container IF not already in a container (avoid double nesting)
			let cont = isContainer(subword, targetWord);
			if (cont != null) {
				let matched: string,
					leftovers = '';
				[matched, leftovers] = cont;
				subWordArray.splice(i, 1);
				let recursive = isDevice(leftovers, subWordArray, 1);
				if (recursive != null) {
					return [
						{
							...stringToIWord(subword),
							direction: findDirection(subword, matched),
							contains: recursive,
						} as IWord,
					];
				}
			}
		}
	}

	//NO MATCHES OF ANY KIND: RETURN NULL.
	return null;

	function isCharade(subword: string, baseword: string) {
		switch ([...subword].sort().join('')) {
			case [...baseword.substring(0, subword.length)].sort().join(''):
				return 'start';
			case [...baseword.substring(baseword.length - subword.length)]
				.sort()
				.join(''):
				return 'end';
			default:
				return null;
		}
	}

	function isContainer(subword: string, baseword: string) {
		if (subword.length < 2) {
			return null;
		}

		let sorted = [...subword].sort().join('');
		let lengthdiff = baseword.length - subword.length;
		if (lengthdiff == 0) {
			return null;
		} //just in case

		for (let i = 1; i + lengthdiff < baseword.length; i++) {
			let middleremoved =
				baseword.slice(0, i) + baseword.slice(i + lengthdiff);

			if ([...middleremoved].sort().join('') == sorted) {
				return [middleremoved, baseword.slice(i, i + lengthdiff)];
			}
		}
		return null;
	}
}

function categoriseWordArraysAsDevices(anagramList: string[][]): IDeviceSet {
	let containers = [] as IDevice[];
	let anagrams = [] as IDevice[];

	for (let anagramSet of anagramList) {
		let device = isDevice(TARGET_WORD, anagramSet);

		if (!device) {
			let anagramDevice = anagramSet.map(stringToIWord) as Array<IWord>;
			anagrams.push({ words: anagramDevice } as IDevice);
		} else {
			containers.push({ words: device } as IDevice);
		}
	}

	return { anagrams, containers } as IDeviceSet;
}

/* :::::::::::::::::::::::::::::::: GENERATOR ::::::::::::::::::::::::::::::: */
export function compareDevices(word: string): void {
	// console.time('Old method');
	// let oldSet = OLD_generateDevices(word);
	// console.timeEnd('Old method');

	console.time('New method');
	let xyz: number = DICTIONARY.get(word).hash;
	let newSet = findValidHashCombinations(xyz);
	console.timeEnd('New method');
}
</script>
