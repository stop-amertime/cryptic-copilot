import {
	monad,
	sortByLengthAscending,
	findDirection,
	arraysEqual,
	cartesianProductOfArrays,
} from './utils';

/* -------------------------------------------------------------------- Data  */
let DICTIONARY: IDictionary = new Map();
let HASHMAP: IWordHashMap = new Map();
let HASHLIST: number[] = [];

/* ------------------------------------------------------------------ Filters */
let MIN_WORD_LENGTH = 15;
let MIN_WORD_SCORE = 20;
let MAX_ANAGRAM_WORDS = 5;
let TARGET_WORD: string;

/* ---------------------------------------------------------- Setup Functions */

export const initialise = (dictionary: IDictionary): boolean => {
	DICTIONARY = dictionary;
	makeHashMap();
	return true;
};

export const updateWordFilters = ({
	length = 15,
	score = 45,
	maxWords = 4,
}): boolean => {
	MIN_WORD_LENGTH = length || MIN_WORD_LENGTH || 15;
	MIN_WORD_SCORE = score || (MIN_WORD_SCORE ?? 45);
	MAX_ANAGRAM_WORDS = maxWords || MAX_ANAGRAM_WORDS || 4;
	return true;
};

export const getDevices = (word: string): IDeviceSet => {
	TARGET_WORD = word;
	console.log('--> DW: Start:' + word);
	return monad(word)
		.chain(findValidHashCombinations)
		.chain(inflateHashCombinations)
		.chain(sortByLengthAscending)
		.chain(categoriseWordArraysAsDevices).value;
};

export const availableFunctions = { initialise, updateWordFilters, getDevices };

/* ----------------------------------------------------------- Event Handling */

self.onmessage = function handle(e: MessageEvent) {
	const { id, request, payload } = e.data;
	const respond = (response: any) => postMessage({ id, request, response });
	const respondErr = () =>
		postMessage({ id, request, error: `Fail: ID-${id} ` });

	monad(payload)
		.chain(availableFunctions?.[request] ?? (noop => noop))
		.output(respond, respondErr);
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

function makeHashMap(): void {
	HASHMAP = new Map();
	HASHLIST = [];

	let temp = new Map() as Map<number, Set<string>>;
	for (let [key, value] of DICTIONARY) {
		if (key.length < 15 && value.score > 46) {
			let wordhash = hash(key);
			let previous = temp.get(wordhash);
			if (previous) {
				temp.set(wordhash, previous.add(key));
			} else {
				temp.set(wordhash, new Set([key]));
			}
		}
	}
	for (let entry of temp) {
		HASHMAP.set(Number(entry[0]), [...entry[1]]);
		HASHLIST.push(Number(entry[0]));
	}
	HASHLIST.sort((a, b) => b - a);
}

const unhash = (hash: number): string[] => {
	return HASHMAP?.get(hash) || hashToKeyArray(hash);
};

const hashToKeyArray = (hash: number): string[] => {
	let string = '';
	for (let [key, value] of letterMap) {
		while (hash % value == 0) {
			string += key;
			hash /= value;
		}
	}
	return [string];
};

const keyToIWord = (word: string): IWord => {
	return { word, ...DICTIONARY.get(word) };
};

function sleep(ms: number) {
	console.log('--WORKER: Sleeping for ' + ms + 'ms');
	var now = new Date().getTime();
	while (new Date().getTime() < now + ms) {}
}

/* ---------------------------------------------------------- Getting Devices */

function findValidHashCombinations(
	input: string | number,
	maxdepth: number = MAX_ANAGRAM_WORDS
): number[][] {
	let inputHash = typeof input == 'number' ? input : hash(input);
	let factorList = [];
	for (let i = 0; i < HASHLIST.length; i++) {
		if (inputHash % HASHLIST[i] == 0) {
			factorList.push(HASHLIST[i]);
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

		let inputLen = unhash(inputHash)[0].length;
		let minLen = (inputLen >> 1) - 1;

		for (let i = start; i < listlen; i++) {
			let iter: number = factorList[i] as number;
			if (HASHMAP.get(iter)[0].length < minLen) continue;
			if (inputHash % iter == 0) {
				let remaining: number = inputHash / iter;
				let indexOfRemaining: number = factorList.findIndex(
					x => x <= remaining
				);
				if (factorList[indexOfRemaining] == remaining) {
					let validCombination = [Number(iter), Number(remaining)]; //inline
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
					returnarray.push([
						Number(iter),
						...combo.map(x => Number(x)),
					]);
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

// function firstHashCombination(hashArrays: number[][]): string[][] {
// 	let output = [] as string[][];
// 	for (let hashArray of hashArrays) {
// 		let wordArray: string[] = hashArray.map(
// 			n => unhash(n).sort(w => DICTIONARY.get(w).score)[0]
// 		);
// 		output.push(wordArray);
// 	}
// 	return output;
// }

// function getFirstHashCombination( hashArrays: number[][] ): string[][] {
//     let output = [] as string[][];
// 	for (let hashArray of hashArrays) {
// 		let wordArray: string[] = hashArray.map(n => unhash(n)[0]);
// }

function isDevice(
	targetWord: string,
	inputWordArray: any[],
	depth = 0
): Array<IWord> {
	let subWordArray = inputWordArray.slice();

	// TRIVIAL CASE - SINGLE WORD
	if (
		subWordArray.length == 1 &&
		subWordArray[0].length == targetWord.length
	) {
		return [
			{
				...keyToIWord(subWordArray[0]),
				direction: findDirection(subWordArray[0], targetWord),
			},
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
						...keyToIWord(subword),
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
						...keyToIWord(subword),
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
							...keyToIWord(subword),
							direction: findDirection(subword, matched),
							contains: recursive,
						},
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
		if (lengthdiff == 0) return null; //just in case

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

	for (let anagramSet of anagramList.slice(0, 1000)) {
		let device = isDevice(TARGET_WORD, anagramSet);

		if (!device) {
			let anagramDevice = anagramSet.map(keyToIWord) as Array<IWord>;
			anagrams.push({ words: anagramDevice } as IDevice);
		} else {
			containers.push({ words: device } as IDevice);
		}
	}

	return { anagrams, containers } as IDeviceSet;
}

////// TO ADD: SORTING, FILTERING, etc.

let ORIGINAL_WORD_ARRAY = [];

///////// GOAL : RETURN if is DEVICE, and Array of 'original' words to compare direction.

function isDevice2(
	targetWord: string,
	inputWordArray: string[],
	depth = 0
): Array<IWord> {
	let subWordArray = inputWordArray.slice();
	if (
		subWordArray.length == 1 &&
		subWordArray[0].length == targetWord.length
	) {
		return [{ ...keyToIWord(subWordArray[0]), direction: targetWord }];
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
						...keyToIWord(subword),
						direction: matched,
						index: inputWordArray.indexOf(subword),
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
						...keyToIWord(subword),
						direction: findDirection(subword, matched),
						index: inputWordArray.indexOf(subword),
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
							...keyToIWord(subword),
							direction: findDirection(subword, matched),
							index: inputWordArray.indexOf(subword),
							contains: recursive,
						} as IWord,
					];
				}
			}
		}
	}

	//NO MATCHES OF ANY KIND: RETURN NULL.
	return null;

	function isCharade(subword: string, baseword: string): string {
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

	function isContainer(
		subword: string,
		baseword: string
	): [match: string, rest: string] {
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
