<script context="module" lang="ts">
/*-----------------------------------------------
Goals: 
--- Main: remove duplicate entries. 
--- Sub: improve performance? 

Changelog: 

- Added make hashmapping, filtering by length < grid letters. 
---- UPDATE THIS when grid is updated? 
-----------------------------------------------*/
type IWordHashMap = Map<number, Set<string>>;
const enum WordDirection {
	Forward = 'forward',
	Reverse = 'reverse',
	Anagram = 'anagram',
}

let HashMapping = new Map() as IWordHashMap;
let HashList: number[];
let DICTIONARY: IDictionary = new Map();

export const setDict = (input: IDictionary): void => {
	DICTIONARY = input;
	createHashMapping();
};
let MIN_WORD_LENGTH: number, MIN_WORD_SCORE: number;
//export method to set minimum word length and minimum word score
export const setWordFilters = (
	length: number = 15,
	score: number = 45
): void => {
	MIN_WORD_LENGTH = length;
	MIN_WORD_SCORE = score;
};

//export method to set
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
	HashMapping = new Map() as IWordHashMap;
	for (let [key, value] of DICTIONARY) {
		if (key.length < 15 && value.score > 46) {
			let previous = HashMapping.get(value.hash);
			if (previous) {
				HashMapping.set(value.hash, previous.add(key));
			} else {
				HashMapping.set(value.hash, new Set([key]));
			}
		}
	}
	HashList = Array.from(HashMapping.keys());
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
						word: subword,
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
						word: subword,
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
							word: subword,
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
let factorList;

const unhash = (hash: number): string[] =>
	[...HashMapping.get(hash)] || hashToStrings(hash);

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

function getValidHashCombinations(
	inputHash: number,
	pos: number = 0,
	maxdepth: number = 4
): number[][] {
	(function findFactorList() {
		factorList = [];
		for (let i = 0; i < HashList.length; i++) {
			if (inputHash % HashList[i] == 0) {
				factorList.push(HashList[i]);
			}
		}
	})();

	let listlen = factorList.length;
	let hashArrays = crawlTree(inputHash, 0, 1);

	function expandHashArrays(hashArrays: number[][]) {
		let output = [] as string[][];
		for (let hashArray of hashArrays) {
			let arrayOfWordArrays: string[][] = hashArray.map(n => unhash(n));

			//find the cartesian product of all the word arrays
			let cartesianProduct = cartesianProductOfArrays(arrayOfWordArrays);
			output.push(...cartesianProduct);

			//remove duplicates
			output = output.filter(
				(item, index) => output.indexOf(item) === index
			);
		}

		function cartesianProductOfArrays(arrays: string[][]) {
			let result = [];
			let temp = [];
			for (let i = 0; i < arrays.length; i++) {
				temp.push(arrays[i]);
				result.push(temp.slice());
				temp.pop();
			}
			return result;
		}

		return output;
	}

	return [[]];

	function crawlTree(inputHash: number, start: number, depth: number) {
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

function isDevice(
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
			let recursive = isDevice(leftovers, subWordArray, depth);
			if (recursive != null) {
				return [
					{
						word: subword,
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
			let recursive = isDevice(leftovers, subWordArray, depth);
			if (recursive != null) {
				return [
					...recursive,
					{
						word: subword,
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
				let recursive = isDevice(leftovers, subWordArray, 1);
				if (recursive != null) {
					return [
						{
							word: subword,
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

function categoriseAsDevices(
	anagramList: string[][],
	targetword: string
): IDeviceSet {
	let containers = [] as IDevice[];
	let anagrams = [] as IDevice[];

	for (let anagramSet of anagramList) {
		if (anagramSet.join('').length != targetword.length) {
			continue;
		}

		let device = isDevice(targetword, anagramSet);

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

/* :::::::::::::::::::::::::::::::: GENERATOR ::::::::::::::::::::::::::::::: */
export function compareDevices(word: string): void {
	// console.time('Old method');
	// let oldSet = OLD_generateDevices(word);
	// console.timeEnd('Old method');

	console.time('New method');
	let xyz: number = DICTIONARY.get(word).hash;
	let newSet = getValidHashCombinations(xyz);
	console.timeEnd('New method');
}
</script>
