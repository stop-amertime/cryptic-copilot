// @ts-nocheck
import LZString from 'lz-string';
import { dictFileStringToMap } from './utils';

//== SETTINGS
let DICT_VERSION = 'ccDict-6.0';
let DICT_SAVECOMPRESSION = 'dict';
let DICT_CACHECOMPRESSION = 'dict';
let DICT_URL = {
	json: `./src/data/${DICT_VERSION}.json`,
	dict: `./src/data/${DICT_VERSION}.dict`,
	compressed: `./src/data/${DICT_VERSION}.lz.txt`,
};
let DEFAULT_LAYOUTURL = './src/data/gridtemplates.json';

const makeStateRecord = (): IStateRecord => JSON.stringify({ layout, wordSlots });

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
		case 'json':
			return JSON.stringify(Array.from(dictionary.entries()));

		case 'dict':
			return dictionaryToDict(dictionary);

		case 'compressed':
			return LZString.compressToUTF16(dictionaryToDict(dictionary));

		default:
			console.error('Incorrect Compression Level Entered!!');
	}
}

function parseDictionary(string: string, compression = 'compressed') {
	switch (compression) {
		case 'json':
			return new Map(JSON.parse(string)) as IDictionary;

		case 'dict':
			return dictFileStringToMap(string);

		case 'compressed':
			return dictFileStringToMap(LZString.decompressFromUTF16(string));

		default:
			console.error('Unable to decompress dictionary!!');
	}
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

	lastOrDefaultDictionary: async (): Promise<IDictionary> => {
		let lastDict = localStorage.getItem('dictionary');
		if (lastDict) return dictFileStringToMap(lastDict);
		else return defaultDictionary();
	},

	defaultDictionary: async (): Promise<IDictionary> => {
		let resp = await fetch(DICT_URL[DICT_SAVECOMPRESSION]);
		string = await resp.text();
		return dictFileStringToMap(string);
	},

	defaultDictionaryFile: async (): Promise<File> => {
		let dict = await fetch(DICT_URL[DICT_SAVECOMPRESSION]);
		let blob = await dict.blob();
		let file = new File([blob], "Cryptic Copilot's Default Dictionary.dict", {
			type: 'text/plain',
		});
		return file;
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
		localStorage.setItem('dictionary', dictionaryToDict(dictionary));
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
