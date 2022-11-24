import { initGrid } from './GridGenerator';
import { dictFileStringToMap, mapToDictFileString } from './utils';

//== SETTINGS
let DICT_VERSION = 'ccDict8';
let DICT_URL = `${DICT_VERSION}.dict`;
let LAYOUTS_URL = 'gridtemplates.json';
let DICT_DEFAULT_NAME = "Cryptic Copilot Default";
let activeFile = null;

const saveLocal = (object: object): void => {
	for (let [key, value] of Object.entries(object)) {
		localStorage.setItem(key, JSON.stringify(value));
	}
};
const loadLocal = (key: string): any => JSON.parse(localStorage.getItem(key));
const noop = (x: any) => x;
let state;
		
export const Load = {

		globalState: async (): Promise<UserGlobalState> => {

			let globalState = {};
			
			const globalLoadParams = new Map([
				["defaultLayouts", {
					get: async () => await fetch(LAYOUTS_URL).then(t=>t.json()),
					parse: noop,
					stringify: (x: IGridLayout[]) => JSON.stringify(x),
				}],
				["dictionary", {
					get: async () => await fetch(DICT_URL).then(t => t.text()),
					parse: (x: string) => dictFileStringToMap(x),
					stringify: noop,
				}],
				["dictionaryVersion", {
					get: () => DICT_VERSION,
					parse: noop,
					stringify: noop,
				}],
				["dictionaryName", {
					get: () => DICT_DEFAULT_NAME,
					parse: noop,
					stringify: noop,
				}],
				["priorityWords", {
					get: () => "[]",
					parse: (x: string) => JSON.parse(x),
					stringify: (x: string[]) => JSON.stringify(x),
				}],
			]);
			
			for (let [key, fns] of globalLoadParams.entries()) {
				let prop;
				if (localStorage.hasOwnProperty(key)) {
					prop = localStorage.getItem(key);
				}
				else {
					prop = await fns.get();
					localStorage.setItem(key, prop);
				}
				console.log({ key, prop });
				globalState[key] = fns.parse(prop);
				console.log("Parsed As: ");
				console.log(globalState[key]);
			}

			return globalState as UserGlobalState;
	},

	puzzleState: async (): Promise<UserState> => {
		let loadedLayout: IGridLayout = JSON.parse(localStorage.getItem('layout')) || JSON.parse(localStorage.getItem('defaultLayouts'))[0];
		let loadedSlots = JSON.parse(localStorage.getItem('slots')) as IWordSlot[];
		let [layout, slots, cells] = initGrid({ wordSlots:loadedSlots, layout:loadedLayout});
		return { layout, slots, cells };
	},

	defaultDictionary: async (): Promise<IDictionary> => {
		let resp = await fetch(DICT_URL);
		let string = await resp.text();
		return dictFileStringToMap(string);
	},

	defaultLayouts: async (): Promise<IGridLayout[]> => {
		let response = await fetch(LAYOUTS_URL);
		let templates = await response.json();
		return templates; 
	},

	loadDefaultDictionary: async (): Promise<IDictionary> => {
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

	stateFromFile: async function (): Promise<IStateRecord> {
		//@ts-ignore
		[activeFile] = await window.showOpenFilePicker();
		const file = await activeFile.getFile();
		const loadedFile = await file.text();
		return JSON.parse(loadedFile) as IStateRecord;
	},
};

export const Save = {
	state: async (stateRecord: IStateRecord): Promise<boolean> => {
		let state = { ...stateRecord };
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
