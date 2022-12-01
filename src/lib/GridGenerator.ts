export function initGrid(
	layout: IGridLayout,
	wordSlots: IWordSlot[]
): UserStateData {
	let cells = makeCells(layout);
	if (wordSlots && wordSlots.length > 0) {
		[cells, wordSlots] = addSlotLettersToCells(cells, wordSlots);
	} else {
		wordSlots = makeWordSlots(layout);
	}
	[cells, wordSlots] = mapCellsToSlots(cells, wordSlots);
	return { layout, wordSlots, cells };
}

function addSlotLettersToCells(cells: ICell[], wordSlots: IWordSlot[]) {
	wordSlots.forEach(slot => {
		if (slot.word) {
			for (let i = 0; i < slot.cells.length; i++) {
				let cellId = slot.cells[i];
				cells[cellId].letter = slot?.word?.[i] || "";
			}
		}
	});
	return [cells, wordSlots] as [ICell[], IWordSlot[]];
}

export function makeCells(gridTemplate: IGridLayout): ICell[] {
	let i = 0;
	let calc_cells = [] as ICell[];
	for (let row of gridTemplate) {
		for (let cell of row) {
			calc_cells.push({
				id: i,
				isValid: cell == 1 ? true : false,
				letter: "",
				isSelected: false,
				isNumbered: false,
			} as ICell);
			i++;
		}
	}
	return calc_cells;
}

export function makeWordSlots(gridTemplate: IGridLayout): IWordSlot[] {
	let rowsize = gridTemplate.length;

	const xytocell = (x: number, y: number): number => x * rowsize + y;

	// Generate wordSlots
	let temp_wordSlots = [] as IWordSlot[];
	let slotIndex = 1;
	let numberedCell = false;

	for (let r = 0; r < rowsize; r++) {
		for (let c = 0; c < rowsize; c++) {
			// If current cell is valid,
			if (gridTemplate[r][c] == 1) {
				// Check for word slots 'Across'
				// ==>     TO THE LEFT is invalid/edge    (and)         TO THE RIGHT is a valid cell.
				if (
					(c == 0 || gridTemplate[r][c - 1] == 0) &&
					c != rowsize - 1 &&
					gridTemplate[r][c + 1] == 1
				) {
					let len = 1;
					let k = c + 1;
					let mycells = [xytocell(r, c)];
					while (k < rowsize && gridTemplate[r][k] == 1) {
						mycells.push(xytocell(r, k));
						len++;
						k++;
					}

					temp_wordSlots.push({
						number: slotIndex,
						orientation: "A",
						clueIndex: slotIndex + "A",
						len: len,
						cells: mycells,
						word: null,
						clue: "",
						intersections: [],
						isImpossible: false,
					} as IWordSlot);

					numberedCell = true;
				}

				// Check for word slots Down - (as above, for TOP/BOTTOM)
				if (
					(r == 0 || gridTemplate[r - 1][c] == 0) &&
					r != rowsize - 1 &&
					gridTemplate[r + 1][c] == 1
				) {
					let len = 1;
					let k = r + 1;
					let mycells = [xytocell(r, c)];
					while (k < rowsize && gridTemplate[k][c] == 1) {
						mycells.push(xytocell(k, c));
						len++;
						k++;
					}
					temp_wordSlots.push({
						number: slotIndex,
						orientation: "D",
						clueIndex: slotIndex + "D",
						len: len,
						cells: mycells,
						word: null,
						clue: "",
						intersections: [],
						isImpossible: false,
					});
					numberedCell = true;
				}

				if (numberedCell) {
					numberedCell = false;
					slotIndex++;
				}
			}
		}
	}
	return temp_wordSlots as IWordSlot[];
}

export function mapCellsToSlots(
	cells: ICell[],
	slots: IWordSlot[]
): [ICell[], IWordSlot[]] {
	// Update each cell with the slots it occupies.
	// Update each slot with a list of intersecting slots.

	let [tmpCells, tmpSlots] = [cells.slice(), slots.slice()];

	tmpCells.forEach((cell, index) => {
		let mySlots = [];
		for (let i = 0; i < slots.length; i++) {
			if (slots[i].cells[0] == cell.id) {
				tmpCells[cell.id].isNumbered = true;
				mySlots.push(i);
			} else if (slots[i].cells.some(c => c === cell.id)) {
				mySlots.push(i);
			}
		}
		tmpCells[index].slots = mySlots;

		if (mySlots.length > 1) {
			let slotA = mySlots[0];
			let slotB = mySlots[1];
			let indexAtA = slots[slotA].cells.indexOf(cell.id);
			let indexAtB = slots[slotB].cells.indexOf(cell.id);

			tmpSlots[slotA].intersections.push({
				slotId: slotB,
				myIndex: indexAtA,
				otherIndex: indexAtB,
			});

			tmpSlots[slotB].intersections.push({
				slotId: slotA,
				myIndex: indexAtB,
				otherIndex: indexAtA,
			});
		}
	});
	return [tmpCells, tmpSlots] as [ICell[], IWordSlot[]];
}
