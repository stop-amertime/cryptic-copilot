import { initGrid } from "./GridGenerator";

/* -------------------------------- SETTINGS -------------------------------- */
let DICT_VERSION = "ccDict8";
let DICT_URL = `${DICT_VERSION}.dict.gz`;
let DEFAULT_LAYOUTURL = "gridtemplates.json";

const LS = localStorage;
const getText = url => fetch(url).then(t => t.text());

/* --------------------------- Initialisation Code -------------------------- */
export const initData = await loadOrInitRequiredData();

export async function loadOrInitRequiredData(): Promise<InitData> {
	let globalData = {} as GlobalData;
	let userStateData = {} as UserStateData;

	let requiredLoadItems: ILoadItemSet<GlobalData> = [
		[
			"dictionary",
			{
				parse: dictStringToMap,
				getDefault: async () => await getText(DICT_URL),
			},
		],
		[
			"defaultLayouts",
			{
				parse: JSON.parse,
				getDefault: async () => await getText(DEFAULT_LAYOUTURL),
			},
		],
		[
			"priorityWords",
			{
				parse: JSON.parse,
				getDefault: async () => "[]",
			},
		],
	];

	let userStateLoadItems: [key: string, fallback: () => any][] = [
		["wordSlots", () => null],
		["layout", () => globalData.defaultLayouts[0]],
	];

	// Load or fetch the required global data.
	for (let [key, { parse, getDefault }] of requiredLoadItems) {
		console.time("--- Loading " + key);
		let item;
		if (LS.hasOwnProperty(key)) {
			item = LS.getItem(key);
		} else {
			console.time("--- Fetching " + key);
			item = await getDefault();
			console.timeEnd("--- Fetching " + key);
			console.time("--- Writing " + key);
			LS.setItem(key, item);
			console.timeEnd("--- Loading " + key);
		}
		globalData[key] = parse(item);
		console.timeEnd("--- Loading " + key);
	}

	// Load previous state, default state.
	for (let [key, fallback] of userStateLoadItems) {
		userStateData[key] = LS.hasOwnProperty(key)
			? JSON.parse(LS.getItem(key))
			: fallback();
	}

	// Initial grid processing.
	// Default layout used if no layout provided.
	let userState = initGrid(userStateData.layout, userStateData.wordSlots);
	return { ...globalData, ...userState };
}

/* -------------------------------- Functions ------------------------------- */
function dictStringToMap(dictstring: string, defaultScore = 50): IDictionary {
	let temp_DICTIONARY = new Map() as IDictionary;
	let wordsarray = dictstring.split("\n");
	for (let arr of wordsarray) {
		let [word, scoreString, abbreviationFor] = arr.split(";");
		if (!word || word.length === 0) continue;

		//Clean Strings
		word = word.replaceAll(/[^A-z]/g, "").toLocaleUpperCase();
		abbreviationFor = abbreviationFor?.trim();

		//ConvertOrDefault & Clamp Score
		let score = scoreString ? parseInt(scoreString) : defaultScore;
		score =
			score < 0 || score > 500 ? Math.min(500, Math.max(0, score)) : score;

		temp_DICTIONARY.set(word, {
			score,
			...(abbreviationFor && { abbreviationFor }),
		});
	}
	return temp_DICTIONARY;
}
