<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { initGrid } from "./lib/GridGenerator";
	import {
		setDictionary,
		PossibleWords,
		getThesaurus,
		getSoundsLike,
	} from "./lib/DictionaryEngine";
	import { Save } from "./lib/FileManager";
	import { onMount } from "svelte";
	import { mapToDictFileString } from "./lib/utils";
	import { initData } from "./lib/Initialisation";
	/* ================================= STORES ================================= */

	/// Dictionary
	export const dictionary = writable(initData.dictionary as IDictionary);
	export const dictionaryName = writable(
		localStorage.getItem("dictionaryName") || "Cryptic Copilot Default"
	);
	export const priorityWords = writable(
		JSON.parse(localStorage.getItem("priorityWords") || "[]") as string[]
	);

	/// Grid
	export const gridLayout = writable(initData.layout as IGridLayout);
	export const wordSlots = writable(initData.wordSlots as IWordSlot[]);
	export const cells = writable(initData.cells as ICell[]);
	export const stateRecord = writable(null as IStateRecord);

	/// Active State ---- CHANGE TO DERIVED?
	export const activeSlotId = writable(null as number);
	export const activeWord = writable(null as string);
	export const activeCells = writable(null as ICellState[]);
	export const activeCellAnimations = writable({ orientation: "A", order: {} });
	export const activePossibleWords = writable([] as IWord[]);
	export const activeSlotBoundingBox = writable(null as IBoundingBox);

	export const activeDeviceList = writable(
		Promise.resolve({}) as Promise<IDeviceSet>
	);
	export const activeThesaurus = writable(
		Promise.resolve({}) as Promise<IThesaurusEntry>
	);
	export const activeSoundsLike = writable(
		Promise.resolve([]) as Promise<IWord[]>
	);

	/* ===================== REQUESTS FROM OTHER COMPONENTS ===================== */

	export const isWordBanned = writable(null as Function);
	export const clearGrid = () => stateRecord.set({ wordSlots: null });
	export const changeLayout = (layout: IGridLayout) =>
		stateRecord.set({ layout, wordSlots: null });
	export const onNew = (writable: any, callback: Function) =>
		writable.subscribe(callback);

	//
</script>

<script lang="ts">
	/* ================================ ON MOUNT ================================ */
	$isWordBanned = (word: string): boolean =>
		isPossibleWordBanned($wordSlots[$activeSlotId], word);

	onMount(() => {
		console.timeEnd("Load Time: ");
		setDictionary($dictionary);
		workerRequest("initialise", $dictionary);
	});

	/* ================================= WORKER ================================= */
	let workerPromises = {};
	let nonce = 0;

	const DeviceWorker = new Worker(
		new URL("./lib/DeviceWorker", import.meta.url),
		{
			type: "module",
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
		console.log("Worker Responded:", { id });
		delete workerPromises[id];
	};

	/* ============================= EVENT HANDLING ============================= */

	///////////////// REMOVE
	onNew(stateRecord, (state: IStateRecord) => {
		if (stateRecord) {
			setState(state);
		}
	});

	function ChangeDictionary(dict: IDictionary) {
		if (!dict) return;
		//Sync Locally
		try {
			localStorage.setItem("dictionary", mapToDictFileString(dict));
			localStorage.setItem("dictionaryName", $dictionaryName);
		} catch (e) {
			console.error(e);
			alert(
				`This dictionary is over 5MB in size. 
            It can be used for now, but can't be saved in your browser between sessions. 
            Before you leave the page, download a copy to use next time.`
			);
		}
		//Sync with Dictionary Engine & Device Worker
		setDictionary(dict);
		workerRequest("initialise", dict);
	}

	onNew(activeWord, (newWord: string) => {
		if ($activeSlotId === null) return;

		$wordSlots[$activeSlotId].word = newWord;

		let updatedCells = findNewCellLetters(newWord);
		refreshCellLetters($wordSlots[$activeSlotId], updatedCells);
		activeCells.set(updatedCells);
		areIntersectingSlotsPossible($wordSlots[$activeSlotId]);
		refreshCellColour($activeSlotId);

		if (newWord) {
			$activeDeviceList = workerRequest("getDevices", newWord);
			$activeThesaurus = getThesaurus(newWord);
			$activeSoundsLike = getSoundsLike(newWord);
		}
	});

	onNew(activeSlotId, (id: number) => {
		if (id === null || !$wordSlots[id]) return;
		let slot = $wordSlots[id];
		refreshCellColour(id);
		refreshActiveSlotProps(slot);
		refreshActiveSlotBoundingBox(slot);
		let [matchArray, len] = mkMatchPredicates(slot);
		$activePossibleWords = PossibleWords.match(matchArray, len);
	});

	onNew(priorityWords, (words: string[]) => {
		localStorage.setItem("priorityWords", JSON.stringify(words));
		setDictionary(null, $priorityWords);
	});

	addEventListener("resize", e =>
		refreshActiveSlotBoundingBox($wordSlots[$activeSlotId])
	);
	/* =============================== FUNCTIONS  =============================== */

	function setState(state: IStateRecord | Partial<IStateRecord>): void {
		let prevState = { layout: $gridLayout, wordSlots: $wordSlots };
		let newState = { ...prevState, ...state };
		if (!newState.layout) return;
		let updatedGrid = initGrid(newState.layout, newState.wordSlots);
		[$gridLayout, $wordSlots, $cells] = [
			updatedGrid.layout,
			updatedGrid.wordSlots,
			updatedGrid.cells,
		];
		// saveState(newState);
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

	function refreshActiveSlotProps(slot: IWordSlot): void {
		$activeWord = slot.word || null;
		$activeCells = makeSlotCellArray(slot);
	}

	function refreshActiveSlotBoundingBox(slot: IWordSlot): void {
		const getCell = (id: number) =>
			document.getElementById(`${id}`) as HTMLDivElement;

		let [firstCell, lastCell] = [
			getCell(slot.cells[0]),
			getCell(slot.cells[slot.cells.length - 1]),
		];

		let left = firstCell.offsetLeft;
		let top = firstCell.offsetTop;
		let width = lastCell.offsetLeft - left + lastCell.offsetWidth;
		let height = lastCell.offsetTop - top + lastCell.offsetHeight;

		activeSlotBoundingBox.set({ top, left, width, height });
	}

	function makeSlotCellArray(slot: IWordSlot): ICellState[] {
		let mycells = [] as ICellState[];

		for (let cellId of slot?.cells) {
			mycells.push({
				id: cellId,
				letter: $cells[cellId].letter,
				isOverwritable: true,
			});
		}

		for (let { slotId, myIndex } of slot.intersections) {
			if ($wordSlots[slotId].word) {
				mycells[myIndex].isOverwritable = false;
			}
		}
		return mycells;
	}

	function refreshCellLetters(slot: IWordSlot, cellStates: ICellState[]) {
		$activeCellAnimations.orientation = slot.orientation;
		let animOrder = 0;

		for (let i = 0; i < slot.cells.length; i++) {
			if (cellStates[i].isOverwritable) {
				let cellId = slot.cells[i];
				if ($cells[cellId].letter != cellStates[i].letter) {
					$activeCellAnimations.order[cellId] = animOrder++;
					$cells[cellId].letter = cellStates[i].letter;
				}
			}
		}
		$cells = $cells;
	}

	function findNewCellLetters(newWord: string): ICellState[] {
		return $activeCells.map((cell, i) => {
			return cell.isOverwritable
				? { ...cell, letter: newWord?.[i] || "" }
				: cell;
		});
	}

	function refreshCellColour(selectedSlot: number): void {
		for (let cell of $cells) {
			$cells[cell.id].isSelected = cell.slots.includes(selectedSlot);

			$cells[cell.id].isImpossible = cell.slots.some(
				s => $wordSlots[s].isImpossible
			);
		}
	}

	function mkMatchPredicates(
		slot: IWordSlot,
		exclude: number = null
	): [IMatchPredicate[], number] {
		let array = [] as [index: number, letter: string][];

		for (let crossing of slot.intersections) {
			if ($wordSlots[crossing.slotId].word && crossing.myIndex !== exclude) {
				let letter = $wordSlots[crossing.slotId].word[crossing.otherIndex];
				array.push([crossing.myIndex, letter]);
			}
		}
		return [array, slot.len];
	}

	function areIntersectingSlotsPossible(slot: IWordSlot): void {
		for (let { slotId } of slot.intersections) {
			if ($wordSlots[slotId].word) continue;
			let [slotCells, len] = mkMatchPredicates($wordSlots[slotId]);
			$wordSlots[slotId].isImpossible = !PossibleWords.hasMatch(slotCells, len);
		}
	}

	function isPossibleWordBanned(slot: IWordSlot, newWord: string) {
		for (let { slotId, myIndex, otherIndex } of slot.intersections) {
			//If the slot has a word, no use checking - it must be possible.
			if ($wordSlots[slotId].word) continue;

			//Create array of slot Cells.
			let [slotCells, len] = mkMatchPredicates($wordSlots[slotId], otherIndex);

			//Substitute the letter in the slot with the new letter.
			slotCells.push([otherIndex, newWord[myIndex]]);

			//Check if that substitution would cause the slot to have no possible words.
			if (!PossibleWords.hasMatch(slotCells, len)) return true;
		}
		return false;
	}
</script>
