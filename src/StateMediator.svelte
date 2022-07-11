<script context="module" lang="ts">
import { writable, derived } from 'svelte/store';
import { makeCells, makeWordSlots, mapCellsToSlots } from './lib/GridGenerator';
import {
	setDictionary,
	PossibleWords,
	getThesaurus,
} from './lib/DictionaryEngine';
import { Save } from './lib/FileManager';

/* ================================= STORES ================================= */

/// Dictionary
export const dictionary = writable(null as IDictionary);

/// Grid
export const gridTemplate = writable(null as IGridLayout);
export const wordSlots = writable(null as IWordSlot[]);
export const cells = writable([] as ICell[]);

/// Active Slot State
export const activeSlotId = writable(null as number);
export const activeWord = writable(null as string);
export const activeCells = writable(null as ISlotCellState[]);
export const activeCellAnimations = writable({ orientation: 'A', order: {} });
export const activePossibleWords = writable([] as IWord[]);

export const activeDeviceList = writable(
	Promise.resolve([]) as Promise<IDeviceSet>
);
export const activeThesaurus = writable(
	Promise.resolve({}) as Promise<IThesaurusEntry>
);
</script>

<script lang="ts">
/* =========================== WEBWORKER REQUESTS =========================== */

const DeviceWorker = new Worker(
	new URL('./lib/DeviceWorker', import.meta.url),
	{
		type: 'module',
	}
);
let workerPromises = {};
let nonce = 0;

const workerRequest = (request: string, payload: any) => {
	let id = ++nonce;
	DeviceWorker.postMessage({ id, request, payload });
	return new Promise(function (resolve, reject) {
		let resolver = resolve;
		let rejecter = reject;
		workerPromises[id] = { resolver, rejecter };
	});
};

/* ============================= EVENT HANDLING ============================= */
DeviceWorker.onmessage = event => {
	let { id, response, error } = event.data;
	if (!workerPromises[id]) return;

	error
		? workerPromises[id].rejecter(error)
		: workerPromises[id].resolver(response);

	delete workerPromises[id];
};

gridTemplate.subscribe(template => initGrid(template));

dictionary.subscribe(dict => {
	if (dict) {
		setDictionary(dict);
		workerRequest('initialise', $dictionary);
	}
});

let timeoutId;
wordSlots.subscribe(val => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		(timeoutId = null), Save.slots(val);
	}, 2000);
});

activeWord.subscribe((newWord: string) => {
	if ($activeSlotId === null) return;

	$wordSlots[$activeSlotId].word = newWord;
	let newCells = calculateUpdatedCells(newWord);
	activeCells.set(newCells);
	refreshGridLetters($wordSlots[$activeSlotId], newCells);

	if (newWord) {
		$activeDeviceList = workerRequest('getDevices', newWord);
		$activeThesaurus = getThesaurus(newWord);
	}
});

activeSlotId.subscribe(async (id: number) => {
	highlightSlotCells(id);
	refreshActiveSlotProps(id);
	$activePossibleWords = PossibleWords.match($activeCells);
});

/* =============================== FUNCTIONS  =============================== */

function initGrid(template: IGridLayout) {
	if (template) {
		$cells = makeCells(template);
		if ($wordSlots) {
			$wordSlots.forEach(slot => {
				if (slot.word) {
					loadGridLetters(slot, slot.word);
				}
			});
		} else {
			$wordSlots = makeWordSlots(template);
		}
		$cells = mapCellsToSlots($cells, $wordSlots);
	}
}

function refreshActiveSlotProps(slotId: number): void {
	if (!slotId || !$wordSlots[slotId]) {
		return;
	}
	let slot = $wordSlots?.[slotId] as IWordSlot;
	let mycells = [] as ISlotCellState[];
	let i = 0;

	for (let cellId of slot?.cells || []) {
		let isOverwritable = true;

		//check the cells slots, to see if it is shared with another slot
		let sharedSlotId = $cells[cellId].slots.find(c => c != slotId);

		//If slot has a valid word in it, That letter is not overwritable.
		if (sharedSlotId !== undefined && $wordSlots[sharedSlotId].word) {
			isOverwritable = false;
		}

		mycells.push({
			letter: $cells[cellId].letter,
			isOverwritable,
		});
	}
	$activeWord = slot?.word || null;
	$activeCells = mycells;
	$activeCellAnimations = { order: {}, orientation: slot?.orientation };
}

function loadGridLetters(slot: IWordSlot, word: string) {
	for (let i = 0; i < slot.cells.length; i++) {
		let cellId = slot.cells[i];
		$cells[cellId].letter = slot.word[i];
	}
}

function refreshGridLetters(slot: IWordSlot, cellStates: ISlotCellState[]) {
	$activeCellAnimations.orientation = slot.orientation;
	let animOrder = 0;

	for (let i = 0; i < slot.cells.length; i++) {
		if (cellStates[i].isOverwritable) {
			let cellId = slot.cells[i];
			if ($cells[cellId].letter != cellStates[i].letter) {
				$activeCellAnimations.order[cellId] = animOrder;
				animOrder++;
				$cells[cellId].letter = cellStates[i].letter;
			}
		}
	}
	$cells = $cells;
}

function calculateUpdatedCells(newWord: string): ISlotCellState[] {
	return $activeCells.map((cellOfSlot, i) => {
		return cellOfSlot.isOverwritable
			? { ...cellOfSlot, letter: newWord?.[i] || '' }
			: cellOfSlot;
	});
}

function highlightSlotCells(id: number): void {
	for (let cell of $cells) {
		$cells[cell.id].isSelected = cell.slots.includes(id);
	}
}
</script>
