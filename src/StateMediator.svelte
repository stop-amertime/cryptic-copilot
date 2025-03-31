<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { initData } from "./lib/Initialisation";
	import { initGrid } from "./lib/GridGenerator";

	/* ================================= STORES ================================= */

	/// Grid
	export const gridLayout = writable(initData.layout as IGridLayout);
	export const wordSlots = writable(initData.wordSlots as IWordSlot[]);
	export const cells = writable(initData.cells as ICell[]);
	export const stateRecord = writable(null as IStateRecord);

	/// Dictionary
	export const dictionary = writable(initData.dictionary as IDictionary);
	export const dictionaryName = writable(
		localStorage.getItem("dictionaryName") || "Cryptic Copilot Default"
	);
	export const priorityWords = writable(
		JSON.parse(localStorage.getItem("priorityWords") || "[]") as string[]
	);

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

	/* ===================== REQUESTS & OTHER FUNCTIONS  ===================== */

	export const isWordBanned = writable(null as Function);
	export const clearGrid = () => stateRecord.set({ wordSlots: null });
	export const changeLayout = (layout: IGridLayout) =>
		stateRecord.set({ layout, wordSlots: null });
	export const loadCrossword = (stateRecord: IStateRecord) => {
		let stateData = initGrid(stateRecord.layout, stateRecord.wordSlots);
		wordSlots.set(stateData.wordSlots);
		cells.set(stateData.cells);
		gridLayout.set(stateData.layout);
	};
	export const onNew = (writable: any, callback: Function) =>
		writable.subscribe(callback);

	//
</script>

<script lang="ts">
	import Grid from "./Grid.svelte";
	import Panel from "./Panel.svelte";
	import {
		setDictionary,
		PossibleWords,
		getThesaurus,
		getSoundsLike,
	} from "./lib/DictionaryEngine";
	import { mapToDictFileString } from "./lib/utils";
	import { onMount } from "svelte";

	export let isLoading;

	/* ================================ ON MOUNT ================================ */
	$isWordBanned = (word: string): boolean =>
		isPossibleWordBanned($wordSlots[$activeSlotId], word);

	onMount(() => {
		isLoading = false;
		setDictionary($dictionary);
		workerRequest("initialise", $dictionary);
	});

	const saveLocal = (input: Object) =>
		debounce(input => saveLocalStorage(input), 500);
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
		
		// Re-sort possible words when priority words change
		if ($activeSlotId !== null && $wordSlots[$activeSlotId]) {
			let slot = $wordSlots[$activeSlotId];
			let [matchArray, len] = mkMatchPredicates(slot);
			$activePossibleWords = PossibleWords.match(matchArray, len);
		}
	});

	(function setupAutoSave() {
		onNew(gridLayout, (layout: IGridLayout) => {
			saveLocalStorage({ layout });
		});

		onNew(wordSlots, (wordSlots: IWordSlot[]) => {
			saveLocalStorage({ wordSlots });
		});
	})();

	addEventListener("resize", e => {
		if (!$activeSlotId) return;
		refreshActiveSlotBoundingBox($wordSlots[$activeSlotId]);
	});

	/* =============================== FUNCTIONS  =============================== */

	function saveLocalStorage(input: Object) {
		for (let [key, value] of Object.entries(input)) {
			localStorage.setItem(key, JSON.stringify(value));
		}
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

.
<div id="main">
	<div id="gridArea">
		<Grid bind:cells={$cells} />
	</div>
	<div id="panelArea">
		<Panel />
	</div>
</div>

<!----------------------------------------------------------------------CSS----->
<style lang="scss" global>
	@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap");
	@import url("https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap");

	* {
		box-sizing: border-box;
		font-family: "Fira Code", monospace;
	}

	.centre {
		position: absolute;
		top: 50%;
		left: 50%;
	}

	@media (min-width: 1000px) {
		#main {
			margin: 0px auto;
			position: absolute 0 0;
			width: 100vw;
			height: 100vh;
			padding: 30px 30px;
			max-width: 1200px;
			overflow-y: auto;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center
		}

		#gridArea {
			flex: 1 0 400px;
			max-width: 800px;
			padding-right: 15px;
			padding: 25px;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: stretch;
		}

		#panelArea {
			flex: 2 0 300px;
			max-width: 600px;
			height: 100%;
		}
	}

	@media (max-width: 799px) {
		#main {
			display: flex;
			flex-direction: column;
			width: 100vw;
			height: 100vh;
			align-items: center;
			justify-items: center;
		}

		#gridArea {
			height: 40%;
			display: flex;
			justify-content: center;
			width: 100%;
			flex: 1 0 1fr;
		}

		#panelArea {
			width: 90%;
			flex: 1 1 auto;
			margin: 20px;
			margin-top: 15px;
		}
	}
</style>
