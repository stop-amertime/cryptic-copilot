// @ts-nocheck
import LZString from 'lz-string';
import { TestScheduler } from 'rxjs/testing';
import { src_url_equal } from 'svelte/internal';

//== SETTINGS
let DICT_VERSION = 'dict-5.0';
let DICT_SAVECOMPRESSION = 'minified';
let DICT_CACHECOMPRESSION = 'minified';
let DICT_URL = {
	raw: `./src/data/${DICT_VERSION}.json`,
	minified: `./src/data/${DICT_VERSION}.min.txt`,
	compressed: `./src/data/${DICT_VERSION}.lz.txt`,
};
let DEFAULT_LAYOUTURL = './src/data/gridtemplates.json';

const makeStateRecord = (): IStateRecord =>
	JSON.stringify({ layout, wordSlots });

const saveLocal = (object: object): void => {
	for (let [key, value] of Object.entries(object)) {
		localStorage.setItem(key, JSON.stringify(value));
	}
};

const loadLocal = (key: string): any => JSON.parse(localStorage.getItem(key));

//== LAST STATE
let activeFile = null;
let defaultLayouts = loadLocal('defaultLayouts');
let state = loadLocal('state');

function stringifyDictionary(dictionary, compression = 'compressed') {
	switch (compression) {
		case 'raw':
			return JSON.stringify(Array.from(dictionary.entries()));

		case 'minified':
			return minifyDictionary(dictionary);

		case 'compressed':
			return LZString.compressToUTF16(minifyDictionary(dictionary));

		default:
			console.error('Incorrect Compression Level Entered!!');
	}
}

function parseAndLoadDictionary(string: string, compression = 'compressed') {
	// todo: move parsing into webworker, load grid before dict.
	switch (compression) {
		case 'raw':
			return new Map(JSON.parse(string)) as IDictionary;

		case 'minified':
			return unminifyDictionary(string);

		case 'compressed':
			return unminifyDictionary(LZString.decompressFromUTF16(string));

		default:
			console.error('Unable to decompress dictionary!!');
	}
}

function minifyDictionary(dictionary) {
	let string = '';
	for (let [key, value] of dictionary) {
		if (value.abbreviationFor) {
			string += `${key} ${value.score};${value.abbreviationFor.join()}#`;
		} else {
			string += `${key} ${value.score}#`;
		}
	}
	return string;
}
function unminifyDictionary(minifiedstring: string) {
	let temp_DICTIONARY = new Map() as IDictionary;
	let wordarray = minifiedstring.split('#');
	for (let parsestring of wordarray) {
		let isAbbreviation = false;
		if (parsestring.includes(';')) {
			isAbbreviation = true;
		}

		parsestring = parsestring.split(';'); // is array ["key&props","defs"]

		let proparray = parsestring[0].split(' '); //  is [key,t(ype),score,hash]

		let wordobject = {
			isAbbreviation,
			score: proparray[1],
		} as IDictionaryEntry;

		if (parsestring.length > 1) {
			wordobject.abbreviationFor = parsestring[1].split(',');
		}

		temp_DICTIONARY.set(proparray[0], wordobject);
	}
	return temp_DICTIONARY;
}

export const Load = {
	lastOrDefaultState: async function (): Promise<IStateRecord> {
		if (!state) {
			let response = await fetch(DEFAULT_LAYOUTURL);
			let templates = await response.json();
			defaultLayouts = templates as IGridLayout[];
			state = { layout: defaultLayouts[0] };
			saveLocal({ state, defaultLayouts });
			return state;
		} else return loadLocal('state');
	},

	lastOrDefaultDictionary: async () => {
		// let response = await fetch(DICT_URL[DICT_SAVECOMPRESSION])
		// let fetchedString = await response.text();

		// let temp_DICTIONARY = new Map() as IDictionary;
		// let wordarray = fetchedString.split('#');
		// for (let parsestring of wordarray) {

		//     let isAbbreviation = false;
		//     if (parsestring.includes(';') ) {let isAbbreviation = true};

		//     parsestring = parsestring.split(';'); // is array ["key&props","defs"]

		//     let proparray = parsestring[0].split(' '); //  is [key,t(ype),score,hash]

		//     let wordobject = { isAbbreviation, "score": proparray[2], "hash": proparray[3] } as IDictionaryEntry;

		//     if (parsestring.length > 1) { wordobject["abbreviationFor"] = parsestring[1].split(',') }

		//     temp_DICTIONARY.set(proparray[0], wordobject);
		//     }

		// document.body.addEventListener('click', () => {
		// downloadUtf16(stringifyDictionary(temp_DICTIONARY,"compressed"))
		// });
		// },
		let dictionary = localStorage.getItem('dictionary');
		if (dictionary) {
			return unminifyDictionary(dictionary);
		} else {
			let response = await fetch(DICT_URL[DICT_SAVECOMPRESSION]);
			let fetchedString = await response.text();
			localStorage.setItem('dictionary', fetchedString);
			let dict = parseAndLoadDictionary(
				fetchedString,
				DICT_SAVECOMPRESSION
			);
			localStorage.setItem('dictionary', minifyDictionary(dict));
			return dict;
			// document.body.addEventListener('click', () =>
			// 	Save.textToFile(
			// 		LZString.compressToUTF16(minifyDictionary(temp_dictionary))
			// 	)
			// );
		}
	},

	defaultLayouts,

	StateFromFile: async function (): IStateRecord {
		[activeFile] = await window.showOpenFilePicker();
		const file = await activeFile.getFile();
		const loadedFile = await file.text();
		return JSON.parse(loadedFile) as IStateRecord;
	},
};

export const Save = {
	state: async (stateRecord: IStateRecord): void => {
		state = { ...state, ...stateRecord };
		saveLocal({ state });

		if (activeFile) {
			const writableStream = await activeFile.createWritable();
			await writableStream.write(makeStateRecord()); // Todo: update staterecord
			await writableStream.close();
		}
	},

	dictionary: async (dictionary: IDictionary): void => {
		localStorage.setItem('dictionary', minifyDictionary(dictionary));
	},

	stateToFile: async () => {
		const saveOptions = {
			types: [
				{
					description: 'Crossword File',
					accept: { 'application/json': ['.cw'] },
				},
			],
		};
		activeFile = await window.showSaveFilePicker(saveOptions);
		const writableStream = await activeFile.createWritable();
		await writableStream.write(stringifyStateRecord());
		await writableStream.close();
	},

	textToFile: async (text: string) => {
		const saveOptions = {
			types: [
				{
					description: 'text',
					accepts: { 'text/plain': ['.txt'] },
				},
			],
		};
		activeFile = await window.showSaveFilePicker(saveOptions);
		const writableStream = await activeFile.createWritable();
		await writableStream.write(text);
		await writableStream.close();
	},
};

function downloadUtf16(str, filename) {
	var charCode,
		byteArray = [];

	// BE BOM
	byteArray.push(254, 255);

	// LE BOM
	// byteArray.push(255, 254);

	for (var i = 0; i < str.length; ++i) {
		charCode = str.charCodeAt(i);

		// BE Bytes
		byteArray.push((charCode & 0xff00) >>> 8);
		byteArray.push(charCode & 0xff);

		// LE Bytes
		// byteArray.push(charCode & 0xff);
		// byteArray.push(charCode / 256 >>> 0);
	}

	var blob = new Blob([new Uint8Array(byteArray)], {
		type: 'text/plain;charset=UTF-16BE;',
	});
	var blobUrl = URL.createObjectURL(blob);

	var link = document.createElement('a');
	link.href = blobUrl;
	link.download = filename;

	if (document.createEvent) {
		var event = document.createEvent('MouseEvents');
		event.initEvent('click', true, true);
		link.dispatchEvent(event);
	} else {
		link.click();
	}
}
