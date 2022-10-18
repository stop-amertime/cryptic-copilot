/* -------------------------------------------------------------- Data, Enums */

import { stringify } from 'querystring';
import { mapTo } from 'rxjs';
import { fileURLToPath } from 'url';

const enum WordDirection {
	Forward = 'forward',
	Reverse = 'reverse',
	Anagram = 'anagram',
}

/* ---------------------------------------------------------- Slide Animation */

type Polarity = 1 | -1;
type directionMap = Map<string, IAnimValues>;

export interface ISlideParams {
	direction?: 'up' | 'down' | 'left' | 'right';
	duration?: number;
	easing?: (t: number) => number;
	delay?: number;
}

interface ISlideInternalParams extends ISlideParams {
	out: boolean;
}

interface IAnimValues {
	translation: 'translateX' | 'translateY';
	distance: number;
	d_polarity: Polarity;
}

export const slideReplaceIn = (node: HTMLElement, args: ISlideParams) =>
	slideReplace(node, { ...args, out: false });
export const slideReplaceOut = (node: HTMLElement, args: ISlideParams) =>
	slideReplace(node, { ...args, out: true });

export function slideReplace(
	node: HTMLElement,
	{ direction = 'left', out = false, duration = 350, easing, delay = 0 }: ISlideInternalParams
): SvelteAnimationReturnType {
	let y = { translation: 'translateY', distance: node.offsetHeight };
	let x = { translation: 'translateX', distance: node.offsetWidth };

	let directionMapper = new Map([
		['up', { ...y, d_polarity: 1 }],
		['down', { ...y, d_polarity: -1 }],
		['left', { ...x, d_polarity: -1 }],
		['right', { ...x, d_polarity: 1 }],
	]) as directionMap;

	let { translation, distance, d_polarity } = directionMapper.get(direction);
	const t_polarity: Polarity = out ? 1 : -1;
	distance = distance * d_polarity;

	return {
		delay,
		duration,
		easing,
		css: t => {
			let displacement = t * distance - distance;
			return `transform:${translation}(${t_polarity * displacement}px);`;
		},
	};
}

/* ------------------------------------------------------------------ Helpers */

export const monad = (input: any) => {
	return {
		value: input,
		chain: (fn: (input: any) => any) => {
			console.time('--> DW: ' + fn.name);
			let result = fn(input);
			console.timeEnd('--> DW: ' + fn.name);
			return monad(result);
		},
		output: (fnPass: (input: any) => void, fnFail: () => void) => {
			if (input) fnPass(input);
			else fnFail();
		},
	};
};

export function findDirection(subword: string, baseword: string): WordDirection {
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

export function arraysEqual(a: string[], b: string[]) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export function cartesianProductOfArrays(arrayOfWordArrays: string[][]): string[][] {
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

export function sortByLengthAscending(arrayOfWordArrays: string[][]): string[][] {
	return arrayOfWordArrays.sort((a, b) => a.length - b.length);
}

/* ==================== STRINGIFY, PARSE & SAVE DICTIONARIES ================ */

export function wordTuplesToDictionary(tuples: IDictTuple[]): IDictionary {
	return new Map(tuples);
}

export function dictionaryToWordTuples(dictionary: IDictionary) {
	return [...dictionary];
}

export const dictFileToMap = (f: File, d = 50) => f.text().then(t => dictFileStringToMap(t, d));
export const mapToDictBlob = (map: IDictionary) => {
	let dictFileString = mapToDictFileString(map);
	return new Blob([dictFileString], { type: 'text/plain' });
};

export const downloadMapAsDictFile = (map: IDictionary, filename = 'dictionary.dict') => {
	let string = mapToDictFileString(map);
	let blob = new Blob([string], { type: 'text/plain' });
	saveBlobAs(blob, filename);
};

export function mapToDictFileString(dictionary: IDictionary): string {
	let string = '';
	for (let [key, value] of dictionary) {
		if (value.abbreviationFor) {
			string += `${key};${value.score};${value.abbreviationFor}\n`;
		} else {
			string += `${key};${value.score}\n`;
		}
	}
	return string;
}

export function dictFileStringToMap(dictstring: string, defaultScore = 50): IDictionary {
	let temp_DICTIONARY = new Map() as IDictionary;
	let wordsarray = dictstring.split('\n');
	for (let arr of wordsarray) {
		let [word, scoreString, abbreviationFor] = arr.split(';');
		if (!word || word.length === 0) continue;

		//Clean Strings
		word = word.replaceAll(/[^A-z]/g, '').toLocaleUpperCase();
		abbreviationFor = abbreviationFor?.trim();

		//ConvertOrDefault & Clamp Score
		let score = scoreString ? parseInt(scoreString) : defaultScore;
		score = score < 0 || score > 500 ? Math.min(500, Math.max(0, score)) : score;

		temp_DICTIONARY.set(word, { score, ...(abbreviationFor && { abbreviationFor }) });
	}

	/// Log Final Output Stats
	console.group(`=== Dictionary Loaded`);
	console.log(`Length: ${temp_DICTIONARY.size} words`);
	console.log(`Size: ${~~dictstring.length / 1000} kB`);
	console.groupCollapsed('=== Sample');
	let i = 0;
	for (let [key, value] of temp_DICTIONARY.entries()) {
		if (i > 2 && !value.abbreviationFor) continue;
		console.log(key, value);
		if (++i > 4) break;
	}
	console.groupEnd();
	console.groupEnd();

	return temp_DICTIONARY;
}

export function stringToBlob(dictString: string) {
	return new Blob([dictString], { type: 'text/plain;charset=utf-8' });
}

export function saveBlobAs(blob: Blob, filename: string) {
	let a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename + '.dict';
	a.click();
}

export function saveFileAs(file: File) {
	let a = document.createElement('a');
	a.href = URL.createObjectURL(file);
	a.download = file.name;
	a.click();
}
