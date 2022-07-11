let DICTIONARY = new Map();
export const setDictionary = (dictionary: IDictionary) => {
	DICTIONARY = dictionary;
};

export function toGridWord(word) {
	return word.toUpperCase().replace(/[^A-Z]/, '');
}

export const getWord = (word: string): IWord => {
	return { word, ...DICTIONARY.get(word) };
};

export const scoreToColour = (score: number): string => {
	if (!score) return 'rgb(220, 220, 220)';
	if (score < 20) return 'hsl(0,75%,85%)';
	else return `hsl(${score * 2}, 75%, 85%)`;
};

export const enum TrafficLight {
	Green = '#44D62C',
	Yellow = '#FA4616',
	Red = '#FF0000',
}

export function cellMatchRegex(cells: ISlotCellState[]): RegExp {
	let searchstring = '';
	cells.forEach(cell => {
		searchstring += cell.isOverwritable ? '.' : cell.letter;
	});
	return new RegExp('(\\b|^)' + searchstring + '(\\b|$)');
}

export async function getThesaurus(word: string): Promise<IThesaurusEntry> {
	const response = await fetch(
		'https://dictionaryapi.com/api/v3/references/thesaurus/json/' +
			word +
			'?key=f6bff6bb-3ff1-42d4-9de7-86291d3e2b26'
	);
	const data = await response.json();

	let partsOfSpeech = [];
	let numberOfSenses = 0;
	for (let D of data) {
		// For each 'part' of speech (noun, verb...)
		if (D.meta == undefined) {
			continue;
		}

		// CHECK CORRECT WORD.
		let cleanword = toGridWord(D.meta.id);
		if (cleanword != word) {
			break;
		}

		let senses = [];

		// CONVERT TO USEFUL FORMAT.

		for (let sensearray of D.def[0].sseq) {
			// For each 'sense' of the word (different definition)
			let senseobj = sensearray[0][1];
			let synonyms = [] as IThesaurusSynonym[];
			let index = 0;

			if (senseobj.syn_list) {
				// If uses syn_list (noun?)
				for (let syn of senseobj.syn_list[0]) {
					let relatedWords = [];

					if (senseobj.rel_list && senseobj.rel_list[index]) {
						for (let rel of senseobj.rel_list[index]) {
							// For each related word to synonym.
							if (rel.wd) {
								relatedWords.push(rel.wd);
							}
						}
						synonyms.push({
							mainWord: syn.wd,
							relatedWords,
						});
						index++;
					}
				}
			} else if (senseobj.sim_list) {
				//IF uses sim_list (adjective?)
				for (let syn of senseobj.sim_list) {
					synonyms.push(<IThesaurusSynonym>{
						mainWord: syn[0].wd,
						relatedWords: syn
							.filter((x: any, index: number) => index != 0)
							.map((x: { wd: any }) => x.wd),
					});
				}
			} else {
				continue;
			} //NEITHER : SKIP

			senses.push(<IThesaurusSense>{
				definition: senseobj.dt[0][1],
				synonyms,
			});
			numberOfSenses++;
		}

		partsOfSpeech.push(<IThesaurusPart>{
			partOfSpeech: D.fl,
			senses,
		});
	}

	let abbreviationFor = DICTIONARY?.get(word)?.abbreviationFor || null;
	if (abbreviationFor) numberOfSenses += abbreviationFor?.length || 0;

	return {
		partsOfSpeech,
		numberOfSenses,
		abbreviationFor,
	} as IThesaurusEntry;
}

export const PossibleWords = {
	match(cells: ISlotCellState[]): IWord[] {
		//? -> Finds all valid words for template e.g. [ _ A B _ _ C ] -> [FABRIC, ..., ...]
		if (!cells || !cells.length) return null;
		let searchregex = cellMatchRegex(cells);
		let searchlength = cells.length;

		// Test through the dictionary
		let possibleWordsArray = [] as IWord[];

		for (let entry of DICTIONARY) {
			if (entry[0].length == searchlength && searchregex.test(entry[0])) {
				possibleWordsArray.push({ word: entry[0], ...entry[1] });
			}
		}
		return possibleWordsArray;
	},

	validate(filterTerm: string, cells: ISlotCellState[]) {
		let searchLength = filterTerm.length;
		let slotLength = cells.length;
		let isValidSearch, userMessage, colour;

		if (cellMatchRegex(cells).test(filterTerm)) {
			isValidSearch = true;
			[userMessage, colour] = [
				`'${filterTerm}' can be entered as a custom word.`,
				TrafficLight.Green,
			];
		} else {
			isValidSearch = false;
			[userMessage, colour] =
				filterTerm.length != slotLength
					? [
							`${searchLength} / ${slotLength} letters needed to be a custom word.`,
							TrafficLight.Yellow,
					  ]
					: [
							`'${filterTerm}' doesn't fit with the letters on the grid.`,
							TrafficLight.Red,
					  ];
		}
		return [isValidSearch, userMessage, colour];
	},

	hasMatch(letters: ISlotCellState[]): boolean {
		let searchregex = this.generateMatchRegex(letters);
		let searchlength = letters.length;

		for (let word of DICTIONARY) {
			if (word[0].length == searchlength && searchregex.test(word[0])) {
				return true;
			}
		}
		return false;
	},
};
