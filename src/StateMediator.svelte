<script context="module" lang="ts">
import { writable, derived } from 'svelte/store';
import { makeCells, makeWordSlots, mapCellsToSlots } from './lib/GridGenerator';
import {
	setDictionary,
	PossibleWords,
	getThesaurus,
} from './lib/DictionaryEngine';
import { Save, Load } from './lib/FileManager';
import { onMount, createEventDispatcher } from 'svelte';

/* ================================= STORES ================================= */

/// Dictionary
export const dictionary = writable(null as IDictionary);

/// Grid
export const gridLayout = writable(undefined as IGridLayout);
export const wordSlots = writable(undefined as IWordSlot[]);
export const cells = writable([] as ICell[]);

/// Saving, Loading State
export const stateRecord = writable(undefined as IStateRecord);
export const clearGrid = stateRecord.set({ wordSlots: null });
export const changeLayout = layout =>
	stateRecord.set({ layout, wordSlots: null });

/// Active State
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

export const onNew = (writable: any, callback: Function) =>
	writable.subscribe(callback);
</script>

<script lang="ts">
/* ================================ ON MOUNT ================================ */
onMount(() => {
	Load.lastOrDefaultDictionary().then(dictionary.set);
});

Load.lastOrDefaultState().then(stateRecord.set);
const dispatch = createEventDispatcher();

let workerPromises = {};
let nonce = 0;

const DeviceWorker = new Worker(
	new URL('./lib/DeviceWorker', import.meta.url),
	{
		type: 'module',
	}
);

const workerRequest = (request: string, payload: any) => {
	let id = ++nonce;
	DeviceWorker.postMessage({ id, request, payload });
	return new Promise(function (resolve, reject) {
		let resolver = resolve;
		let rejecter = reject;
		workerPromises[id] = { resolver, rejecter };
	});
};

DeviceWorker.onmessage = event => {
	let { id, response, error } = event.data;
	if (!workerPromises[id]) return;

	error
		? workerPromises[id].rejecter(error)
		: workerPromises[id].resolver(response);

	delete workerPromises[id];
};

/* ============================= EVENT HANDLING ============================= */

onNew(stateRecord, (state: IStateRecord) => {
	dispatch('isLoading', true);
	setState(state);
	dispatch('isLoading', false);
});

onNew(dictionary, (dict: IDictionary) => {
	setDictionary(dict);
	workerRequest('setDictionary', dict);
});

onNew(activeWord, (newWord: string) => {
	if ($activeSlotId === null) return;

	$wordSlots[$activeSlotId].word = newWord;
	$activeCells = calculateUpdatedCells(newWord);
	refreshGridLetters($wordSlots[$activeSlotId], $activeCells);
	checkAnyValidWords($wordSlots[$activeSlotId].cells);

	if (newWord) {
		$activeDeviceList = workerRequest('getDevices', newWord);
		$activeThesaurus = getThesaurus(newWord);
	}
	Save.state({ wordSlots: $wordSlots });
});

onNew(activeSlotId, (id: number) => {
	highlightSlotCells(id);
	refreshActiveSlotProps(id);
	$activePossibleWords = PossibleWords.match($activeCells);
});

/* =============================== FUNCTIONS  =============================== */

function setState(state: IStateRecord | Partial<IStateRecord>): void {
	let prevState = { layout: $gridLayout, wordSlots: $wordSlots };
	let newState = { ...prevState, ...state };
	if (!newState.layout) return;
	[$gridLayout, $wordSlots, $cells] = initGrid(newState);
	saveState(newState);
}

function saveState(toSave: IStateRecord) {
	debounce(Save.state, 3000)(toSave);
}

function debounce(func: Function, wait: number) {
	let timeout = null;
	return (...args: any[]) => {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			func.apply(context, args);
		}, wait);
	};
}

function initGrid(state: IStateRecord): [IGridLayout, IWordSlot[], ICell[]] {
	let { layout, wordSlots } = state;
	if (!layout) return;
	let cells = makeCells(layout);
	if (wordSlots && wordSlots.length > 0) {
		wordSlots.forEach(slot => {
			if (slot.word) {
				loadGridLetters(slot, cells);
			}
		});
	} else {
		wordSlots = makeWordSlots(layout);
	}
	cells = mapCellsToSlots(cells, wordSlots);

	return [layout, wordSlots, cells];
}

function refreshActiveSlotProps(slotId: number): void {
	let slot = $wordSlots?.[slotId];
	if (!slotId || !slot) return;

	$activeWord = slot.word || null;
	$activeCells = makeSlotCellArray(slot);
	$activeCellAnimations = { order: {}, orientation: slot.orientation };
}

function makeSlotCellArray(slot: IWordSlot): ISlotCellState[] {
	let mycells = [] as ISlotCellState[];
	let slotId = $wordSlots.indexOf(slot);

	for (let cellId of slot?.cells || []) {
		let isOverwritable = true;
		let sharedSlotId = $cells[cellId].slots.find(c => c != slotId);
		if (sharedSlotId !== undefined && $wordSlots[sharedSlotId].word) {
			isOverwritable = false;
		}

		mycells.push({
			letter: $cells[cellId].letter,
			isOverwritable,
		});
	}
	return mycells;
}

function loadGridLetters(slot: IWordSlot, cells: ICell[]): void {
	for (let i = 0; i < slot.cells.length; i++) {
		let cellId = slot.cells[i];
		cells[cellId].letter = slot?.word?.[i] || '';
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
	return $activeCells.map((cell, i) => {
		return cell.isOverwritable
			? { ...cell, letter: newWord?.[i] || '' }
			: cell;
	});
}

function highlightSlotCells(id: number): void {
	for (let cell of $cells) {
		$cells[cell.id].isSelected = cell.slots.includes(id);
	}
}

function reddenSlotCells(id: number, state: boolean): void {
	for (let cell of $wordSlots[id].cells) {
		$cells[cell].isImpossible = state;
	}
}

function checkAnyValidWords(cellIds: number[]) {
	for (let id of cellIds) {
		let intersectingSlotId = $cells[id].slots.find(s => s != $activeSlotId);
		let intersectingSlot = $wordSlots[intersectingSlotId];
		if (intersectingSlot !== undefined && !intersectingSlot.word) {
			let cellStates = makeSlotCellArray(intersectingSlot);
			let isImpossible = !PossibleWords.hasMatch(cellStates);
			reddenSlotCells(intersectingSlotId, isImpossible);
		}
	}
}
</script>
