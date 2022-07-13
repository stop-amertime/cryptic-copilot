/* -------------------------------------------------------------- Data, Enums */

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
	{
		direction = 'left',
		out = false,
		duration = 350,
		easing,
		delay = 0,
	}: ISlideInternalParams
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
			let result = fn(input);
			return monad(result);
		},
		output: (fnPass: (input: any) => void, fnFail: () => void) => {
			if (input) fnPass(input);
			else fnFail();
		},
	};
};

export function findDirection(
	subword: string,
	baseword: string
): WordDirection {
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

export function cartesianProductOfArrays(
	arrayOfWordArrays: string[][]
): string[][] {
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

export function sortByLengthAscending(
	arrayOfWordArrays: string[][]
): string[][] {
	return arrayOfWordArrays.sort((a, b) => a.length - b.length);
}
