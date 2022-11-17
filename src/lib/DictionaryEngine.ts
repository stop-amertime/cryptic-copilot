let DICTIONARY = new Map();
let PRIORITY_WORDS = {};
let WORDS_OF_LENGTH = new Map() as Map<number, string[]>;

export const setDictionary = (dictionary: IDictionary = null, priorityWords: string[] = null) => {
	if (dictionary) {
		DICTIONARY = dictionary;
		WORDS_OF_LENGTH = groupByLength([...dictionary.keys()]);
		console.log('---- DictEngine Initialised');
	}
	if (priorityWords) {
		PRIORITY_WORDS = {};
		for (let word of priorityWords) {
			PRIORITY_WORDS[word] = 1;
		}
		console.log('---- Priority Words Updated');
		console.log(JSON.stringify(priorityWords));
	}
};

export const getDictionaryFromFile = (Url: string) => {
	return fetch(Url)
		.then(response => response.text())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.log(error);
		});
};

export const parseDictionaryFromText = (dictionary: string) => {
	//DICT FORMAT: word OR word;score \n
	//DICTX FORMAT: word;score#abbr1,abbr2..
	// Options:
	// Overwrite scores for existing words
	// Default score for unscored words
};

function groupByLength(list: Array<any>) {
	const map = new Map();

	for (let item of list) {
		if (typeof item != null && item != null) {
			const key = item.length;
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		}
	}
	return map;
}

export const toGridWord = word => word.toUpperCase().replace(/[^A-Z]/, '');
export const getWord = (word: string): IWord => ({
	word,
	...DICTIONARY.get(word),
});

export const scoreToColour = (score: number): string => {
	if (!score) return 'rgb(220, 220, 220)';
	else return `hsl(${Math.round(score * 1.25)}, 100%, 85%)`;
};

const byScoreThenRandom = (a: IWord, b: IWord) =>
	isPriorityWord(b.word) - isPriorityWord(a.word) || +b.score - +a.score || Math.random() - 0.5;

export const isPriorityWord = (word: string): number => PRIORITY_WORDS[word] ?? 0;

export const enum TrafficLight {
	Green = '#44D62C',
	Yellow = '#FA4616',
	Red = '#FF0000',
}

export function cellMatchRegex(cells: ICellState[]): RegExp {
	let searchstring = '';
	for (let cell of cells) {
		searchstring += cell.isOverwritable ? '.' : cell.letter;
	}
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

	let dictEntry = DICTIONARY?.get(word) as IDictEntry;
	let abbreviationFor = dictEntry?.abbreviationFor || null;
	if (abbreviationFor) numberOfSenses += abbreviationFor?.split(',')?.length || 0;

	return {
		partsOfSpeech,
		numberOfSenses,
		abbreviationFor,
	} as IThesaurusEntry;
}

export async function getSoundsLike(word: string): Promise<IWord[]> {
	return fetch('https://api.datamuse.com/words?sl=' + word)
		.then(r => r.json())
		.then(r => parseDatamuseSoundslike(word, r));
}

function parseDatamuseSoundslike(inputWord: string, resp: DatamuseWord[]): IWord[] {
	let output: IWord[] = [];
	let limit = 95;
	for (let word of resp) {
		if (word.score > limit) {
			let capsWord = word.word.toUpperCase();
			if (capsWord == inputWord) continue;
			output.push({ word: capsWord, score: word.score - limit });
		} else break;
	}
	return output;
}

export function getMatchArray(cells: ICellState[]): IMatchPredicate[] {
	let array = [] as [index: number, letter: string][];
	for (let i = 0; i < cells.length; i++) {
		if (!cells[i].isOverwritable) {
			array.push([i, cells[i].letter]);
		}
	}
	return array;
}

export const PossibleWords = {
	match(matchArray: IMatchPredicate[], searchLength: number): IWord[] {
		//? -> Finds all valid words for template e.g. [ _ A B _ _ C ] -> [FABRIC, ..., ...]
		let possibleWordsArray = [] as IWord[];

		if (matchArray.length == 0)
			possibleWordsArray = WORDS_OF_LENGTH.get(searchLength).map(getWord);
		else {
			checkword: for (let word of WORDS_OF_LENGTH.get(searchLength)) {
				for (let [index, letter] of matchArray) {
					if (word[index] != letter) continue checkword;
				}
				possibleWordsArray.push({ word, ...DICTIONARY.get(word) });
			}
		}
		possibleWordsArray.sort((a, b) => byScoreThenRandom(a, b));
		return possibleWordsArray;
	},

	validate(filterTerm: string, cells: ICellState[]) {
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

	hasMatch(matchArray: IMatchPredicate[], searchLength: number): boolean {
		checkword: for (let word of WORDS_OF_LENGTH.get(searchLength)) {
			for (let [index, letter] of matchArray) {
				if (word[index] != letter) continue checkword;
			}
			return true;
		}
		return false;
	},
};
