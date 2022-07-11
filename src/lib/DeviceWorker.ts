/* -------------------------------------------------------------------- Data  */
let DICTIONARY: IDictionary = new Map();
let HASHMAP: IWordHashMap = new Map();
let HASHLIST: number[] = [];

/* ------------------------------------------------------------------ Filters */
let MIN_WORD_LENGTH: number;
let MIN_WORD_SCORE: number;
let MAX_ANAGRAM_WORDS: number;
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
	return monad(word)
		.chain(findValidHashCombinations)
		.chain(inflateHashCombinations)
		.chain(sortByLengthAscending)
		.chain(categoriseWordArraysAsDevices).value;

	// Add sorting in here later.
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
			let previous = temp.get(value.hash);
			if (previous) {
				temp.set(value.hash, previous.add(key));
			} else {
				temp.set(value.hash, new Set([key]));
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
	return [string + '!!!'];
};

const keyToIWord = (word: string): IWord => {
	return { word, ...DICTIONARY.get(word) };
};

/* ----------------------------------------------  String & Array Helpers   */

const monad = (input: any) => {
	return {
		value: input,
		chain: (fn: (input: any) => any) => {
			if (!input) console.warn('FAILED TO: ', fn.name);
			console.time(fn.name);
			let result = fn(input);
			console.timeEnd(fn.name);
			return monad(result);
		},
		output: (fnPass: (input: any) => void, fnFail: () => void) => {
			if (input) fnPass(input);
			else fnFail();
		},
	};
};

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

function arraysEqual(a: string[], b: string[]) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

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

function sortByLengthAscending(arrayOfWordArrays: string[][]): string[][] {
	return arrayOfWordArrays.sort((a, b) => a.length - b.length);
}

const enum WordDirection {
	Forward = 'forward',
	Reverse = 'reverse',
	Anagram = 'anagram',
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

		for (let i = start; i < listlen; i++) {
			let iter: number = factorList[i] as number;
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
		for (let i = 0; i < cartesianProduct.length; i++) {
			if (!output.some(a => arraysEqual(a, cartesianProduct[i]))) {
				output.push(cartesianProduct[i]);
			}
		}
	}
	return output;
}

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
			let anagramDevice = anagramSet.map(keyToIWord) as Array<IWord>;
			anagrams.push({ words: anagramDevice } as IDevice);
		} else {
			containers.push({ words: device } as IDevice);
		}
	}

	return { anagrams, containers } as IDeviceSet;
}

////// TO ADD: SORTING, FILTERING, etc.
