/* ================================ CONSTANTS =============================== */
const enum WordDirection {
	Forward = 'forward',
	Reverse = 'reverse',
	Anagram = 'anagram',
}

const trivialEndings = ['ER', 'ED', 'S', 'ING', 'ABLE'];
const averageScore = (arr: IWord[]) => {
	return (
		arr.reduce(
			(partialsum: number, x: IWord): any =>
				partialsum + DICTIONARY?.get(x.word)?.score || 0,
			0
		) / arr.length
	);
};

let DICTIONARY: IDictionary = new Map();

/* ================================ INTERFACE =============================== */

self.onmessage = function handleMessageFromMain(event: {
	data: { payload: any; request: any; id?: any };
}) {
	const { id, request, payload } = event.data;

	const respond = (response: string | string[] | IDeviceSet) =>
		postMessage({ id, request, response });
	const respondError = (error: string) => postMessage({ id, request, error });

	if (!event.data.payload) {
		return;
	}

	switch (event.data?.request) {
		case 'setDictionary': {
			DICTIONARY = payload;

			console.time('Sorting Workers Dictionary');
			DICTIONARY = new Map(
				Array.from(DICTIONARY).sort(a => a[1]?.score || 0)
			);
			console.timeEnd('Sorting Workers Dictionary');

			respond('Done.');
			break;
		}

		case 'getPossibleWords': {
			respond(validWordFinder.search(payload));
			break;
		}

		case 'getDevices': {
			let thesaurus = Devices.fetchAndParseThesaurus(payload);
			let deviceSet = generateDevices(payload);
			thesaurus.then(thesaurus => respond({ thesaurus, ...deviceSet }));
			break;
		}

		default: {
			respondError('Invalid Request Type: ' + request);
			return;
		}
	}
};

export function setDictionary(dictionary: IDictionary): void {
	DICTIONARY = dictionary;
}

/* ================================= HELPERS ================================ */
/* .................................................................. Hashing */

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

/* ............................................................ Array Helpers */

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

function sortWordsByScoreThenRandomly(a: string, b: string) {
	return (
		DICTIONARY.get(b).score - DICTIONARY.get(a).score || 0.5 - Math.random()
	);
}

/* ........................................................... String Helpers */

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
//}

/* ======================= ANAGRAM AND DEVICE SOLVING ======================= */
/* ............................................................... Generation */

export const Devices = {
	get(word: string) {
		let deviceSet = generateDevices(word);
		// LET THESAURUS ENTRY = GET THESAURUS ENTRY
		return deviceSet;
	},

	async fetchAndParseThesaurus(word: string) {
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
				partsOfSpeech = [];
				break;
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
	},
};

function generateDevices(targetword: string) {
	//== THE NEW DEVICE SEARCHER WITH PRIME-HASHING!

	console.time('Crawl Anagram Tree');
	let uncategorisedAnagrams = crawlAnagramTree(targetword, DICTIONARY);
	console.timeEnd('Crawl Anagram Tree');

	//SHOW ME THE BROKEN ONES
	console.table(
		uncategorisedAnagrams.filter(
			a => a.join('').length != targetword.length
		)
	);

	let devices = categoriseAsDevices(
		<string[]>uncategorisedAnagrams,
		<string>targetword
	); //Categorise
	sortDevices(devices); //Sort
	return devices as IDeviceSet;
}

function crawlAnagramTree(
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
		let anagramsofremainingword = crawlAnagramTree(
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

function searchHiddenWords(searchWord: string) {
	//= Find 2 words with word hidden inside.
	/*
    for (let l=2; l+1<letterarray.length; l++)
    {

        if (letterarray.length < 6) return;

        w1 = letterarray.slice(0,l).join("");
        w2 = letterarray.slice(l,).join("");


        let starttest = w1 + "$";
        let endtest = "^" + w2;
        let regex1 = new RegExp(starttest);
        let regex2 = new RegExp(endtest);
        var starts = wordList.filter(w => regex1.test(w));
        if (starts.length > 0)
        {
            var ends = wordList.filter(w => regex2.test(w));
            if (ends.length > 0)
            {
      
            }
        }

    }
    */

	//= Find 3-word hiddens.

	// FIND INCLUDED WORDS
	let internalWords = [];

	for (let [key, value] of DICTIONARY) {
		if (
			key.length > 2 &&
			searchWord.includes(key) &&
			!searchWord.startsWith(key) &&
			!searchWord.endsWith(key)
		) {
			internalWords.push(key);
		}
	}

	// FIND HIDDEN SENTENCES
	let hiddenSentences = new Map();

	for (let internalWord in internalWords) {
		let internalWordStartIndex = searchWord.indexOf(internalWord);
		let internalWordEndIndex = internalWordStartIndex + internalWord.length;

		let w1 = searchWord.substring(0, internalWordStartIndex);
		let w2 = searchWord.substring(internalWordEndIndex);

		let starttest = '.+' + w1 + '$';
		let endtest = '^' + w2 + '.+';
		let regexStart = new RegExp(starttest);
		let regexEnd = new RegExp(endtest);

		let starts = [];
		let ends = [];
		for (let word in DICTIONARY.keys) {
			if (regexStart.test(word)) {
				starts.push(word);
			}
			if (regexEnd.test(word)) {
				ends.push(word);
			}
		}

		if (starts.length > 0 && ends.length > 0) {
			let out = [];
			for (let i = 0; i < starts.length && i < ends.length; i++) {
				out.push([starts[i], internalWord, ends[i]]);
			}
			hiddenSentences.set(`...${w1} ${internalWord} ${w2}...`, out);
		}
	}

	// OUTPUT MAP STRUCTURE : KEY-subheading, VALUE-array of subvalues
	// Format accordingly, returning an array of [div,  div, ... ]
	return hiddenSentences;
}

/* .................................................................. Sorting */

function rateDevice(wordarray: Array<IWord>): number {
	let comp = 0; //complexity
	let score = 0; //scoreofwords

	// flatten
	for (let i = 0; i < wordarray.length; i++) {
		if (wordarray[i].contains != null) {
			wordarray.concat(wordarray[i].contains);
			comp += 1; // ABOUT factor - first is free, subsequent are heavily punished.
		}

		if (wordarray[i].direction == WordDirection.Reverse) {
			comp += 1;
		} // REVERSE factor.
		else if (wordarray[i].direction == WordDirection.Anagram) {
			comp += 1;
		} // SCRAMBLED factor.

		wordarray[i].score = DICTIONARY.get(wordarray[i].word).score;
		score += wordarray[i].score;
		score += wordarray[i].word.length * 2;
	}

	//// Take average of Word Scores
	//// Each point of complexity should reduce average word score by 10

	let out = ~~(score / wordarray.length) - 5 * wordarray.length - 3 * comp;

	return out;
}

function categoriseAsDevices(
	anagramList: any[],
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
			if (!trivialEndings.includes(device[device.length - 1].word))
				//Filter out trivial endings, doesnt work??.
				containers.push({ words: device } as IDevice);
		}
	}

	return { anagrams, containers } as IDeviceSet;
}

function sortDevices(devices: IDeviceSet): void {
	if (devices.anagrams) {
		devices.anagrams.sort((a, b) => {
			return (
				a.words.length - b.words.length ||
				averageScore(a.words) - averageScore(b.words)
			);
		});
	}

	if (devices.containers) {
		devices.containers.sort(function (a, b) {
			//= sort devices
			return rateDevice(b.words) - rateDevice(a.words);
		});
	}
}

/* ========================= FINDING POSSIBLE WORDS ========================= */

export const validWordFinder = {
	search(cells: ISlotCellState[]): string[] {
		let searchregex = generateMatchRegex(cells);
		let searchlength = cells.length;

		// Test through the dictionary
		let possibleWordsArray = [];

		for (let key of DICTIONARY.keys()) {
			if (key.length == searchlength && searchregex.test(key)) {
				possibleWordsArray.push(key);
			}
		}

		return possibleWordsArray;
	},

	checkValidNewWord(filterTerm: string, cells: ISlotCellState[]) {
		let searchLength = filterTerm.length;
		let slotLength = cells.length;
		let isValidSearch: boolean, userMessage: any, colour: any;

		if (generateMatchRegex(cells).test(filterTerm)) {
			isValidSearch = true;
			[userMessage, colour] = [
				`'${filterTerm}' can be entered as a custom word.`,
				'#44D62C',
			];
		} else {
			isValidSearch = false;
			[userMessage, colour] =
				filterTerm.length != slotLength
					? [
							`${searchLength} / ${slotLength} letters needed to be a custom word.`,
							'#FA4616',
					  ]
					: [
							`'${filterTerm}' doesn't fit with the letters on the grid.`,
							'#E40046',
					  ];
		}
		return [isValidSearch, userMessage, colour]; //todo: Move Search Logic into Component?
	},

	anyPossibleWord(letters: ISlotCellState[]): boolean {
		let searchregex = this.generateMatchRegex(letters);
		let searchlength = letters.length;

		// Test through the dictionary
		for (let word of DICTIONARY.keys()) {
			if (word.length == searchlength && searchregex.test(word)) {
				return true;
			}
		}
		return false;
	},
};

function generateMatchRegex(cells: ISlotCellState[]): RegExp {
	let searchstring = '';
	cells.forEach(cell => {
		searchstring += cell.isOverwritable ? '.' : cell.letter;
	});

	return new RegExp('(\\b|^)' + searchstring + '(\\b|$)');
}

const scoreToColour = (score: number): string => {
	if (score < 20) return 'hsl(0,75%,85%)';
	else return `hsl(${score * 2}, 75%, 85%)`;
};

/* =========================== FETCHING WORD INFO =========================== */

export const WordInfo = {
	get(word: string) {
		let entry: IDictionaryEntry = DICTIONARY.get(word);
		return {
			colour: scoreToColour(entry.score),
			isAbbreviation: entry.isAbbreviation,
		};
	},
};
