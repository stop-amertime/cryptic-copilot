import { dictFileStringToMap, mapToDictFileString } from './utils';

//== SETTINGS
let DICT_VERSION = 'ccDict8';
let DICT_URL = `${DICT_VERSION}.dict`;
let DEFAULT_LAYOUTURL = 'gridtemplates.json';

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
		let lastVersion = localStorage.getItem('dictVersion');
		if (!lastDict || !lastVersion || lastVersion != DICT_VERSION) {
			console.warn('No dictionary found - loading...');
			let x = Load.defaultDictionary();
			return x;
		} else {
			return dictFileStringToMap(lastDict);
		}
	},

	defaultDictionary: async (): Promise<IDictionary> => {
		let resp = await fetch(DICT_URL);
		let string = await resp.text();
		return dictFileStringToMap(string);
	},

	defaultDictionaryFile: async (): Promise<File> => {
		let dict = await fetch(DICT_URL);
		let blob = await dict.blob();
		let file = new File([blob], "Cryptic Copilot's Default Dictionary.dict", {
			type: 'text/plain',
		});
		return file;
	},

	defaultLayouts,

	StateFromFile: async function (): Promise<IStateRecord> {
		//@ts-ignore
		[activeFile] = await window.showOpenFilePicker();
		const file = await activeFile.getFile();
		const loadedFile = await file.text();
		return JSON.parse(loadedFile) as IStateRecord;
	},
};

export const Save = {
	state: async (stateRecord: IStateRecord): Promise<boolean> => {
		state = { ...state, ...stateRecord };
		saveLocal({ state });

		if (activeFile) {
			const writableStream = await activeFile.createWritable();
			await writableStream.write(JSON.stringify(state));
			await writableStream.close();
		}

		return true;
	},

	dictionary: (dictionary: IDictionary) => {
		localStorage.setItem('dictionary', mapToDictFileString(dictionary));
		localStorage.setItem('dictVersion', DICT_VERSION);
		return true;
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
		//@ts-ignore
		activeFile = await window.showSaveFilePicker(saveOptions);
		const writableStream = await activeFile.createWritable();
		await writableStream.write(JSON.stringify(state));
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
		//@ts-ignore
		activeFile = await window.showSaveFilePicker(saveOptions);
		const writableStream = await activeFile.createWritable();
		await writableStream.write(text);
		await writableStream.close();
	},
};

// function downloadUtf16(str, filename) {
// 	var charCode,
// 		byteArray = [];

// 	// BE BOM
// 	byteArray.push(254, 255);

// 	// LE BOM
// 	// byteArray.push(255, 254);

// 	for (var i = 0; i < str.length; ++i) {
// 		charCode = str.charCodeAt(i);

// 		// BE Bytes
// 		byteArray.push((charCode & 0xff00) >>> 8);
// 		byteArray.push(charCode & 0xff);

// 		// LE Bytes
// 		// byteArray.push(charCode & 0xff);
// 		// byteArray.push(charCode / 256 >>> 0);
// 	}

// 	var blob = new Blob([new Uint8Array(byteArray)], {
// 		type: 'text/plain;charset=UTF-16BE;',
// 	});
// 	var blobUrl = URL.createObjectURL(blob);

// 	var link = document.createElement('a');
// 	link.href = blobUrl;
// 	link.download = filename;

// 	if (document.createEvent) {
// 		var event = document.createEvent('MouseEvents');
// 		event.initEvent('click', true, true);
// 		link.dispatchEvent(event);
// 	} else {
// 		link.click();
// 	}
// }
