
export function makeCells(gridTemplate: IGridLayout){
    let i=0;
    let calc_cells = [];
    for (let row of gridTemplate){
        for (let cell of row){
            calc_cells.push({
                "id":i,
                "isValid": cell==1 ? true : false ,
                "letter": '',
                "isSelected":false,
                "isNumbered": false,
            } as ICell);
        i++;
        }
    }
    return calc_cells;
}

export function makeWordSlots(gridTemplate: IGridLayout) {
    
        let rowsize = gridTemplate.length;

        const xytocell = (x: number, y: number) :number => 
                x * rowsize + y;

        // Generate wordSlots
        let temp_wordSlots=[];
        let slotIndex = 1;
        let numberedCell = false;

        for (let r = 0; r < rowsize; r++) {
            for (let c = 0; c < rowsize; c++) {

                // If current cell is valid,
                if (gridTemplate[r][c] == 1) {

                    // Check for word slots 'Across'
                    // ==>     TO THE LEFT is invalid/edge    (and)         TO THE RIGHT is a valid cell.
                    if ((c == 0 || gridTemplate[r][c - 1] == 0) && c != rowsize - 1 && gridTemplate[r][c + 1] == 1) {
                        let len = 0; let k = c+1; let mycells = [xytocell(r,c)];
                        while (k < rowsize && gridTemplate[r][k] == 1) { 
                            mycells.push(xytocell(r,k));
                            len += 1; k += 1; 
                        }

                        temp_wordSlots.push({
                            "number" : slotIndex,
                            "orientation": "A",
                            "clueIndex" : slotIndex + "A",
                            "len":len, 
                            "cells": mycells,
                            "word": null,
                            "clue": ""
                        } as IWordSlot);

                        numberedCell = true; 
                    }

                    // Check for word slots Down - (as above, for TOP/BOTTOM)
                    if (
                    (r == 0 || gridTemplate[r - 1][c] == 0)                 
                    && r != rowsize - 1 && gridTemplate[r + 1][c] == 1) {   

                        let len = 0; let k = r+1; let mycells = [xytocell(r,c)];
                        while (k < rowsize && gridTemplate[k][c] == 1) {
                            mycells.push(xytocell(k,c));
                            len += 1; k += 1; 
                        }
                        temp_wordSlots.push({
                            "number" : slotIndex,
                            "orientation": "D",
                            "clueIndex" : slotIndex + "D",
                            "len":len,
                            "cells": mycells,
                            "word": null,
                            "clue": ""
                        });
                        numberedCell = true; 
                    }

                    if (numberedCell){
                        numberedCell = false; 
                        slotIndex++;
                    }
                }
            }
        }
        return temp_wordSlots;
}

export function mapCellsToSlots(cells: ICell[], slots: IWordSlot[]) {
        
    // Update each cell with the slots it occupies. 
    cells.forEach( (cell,index) => {

        let mySlots = [];
        for(let i = 0; i < slots.length; i++){

            if (slots[i].cells[0] == cell.id){
                cells[cell.id].isNumbered = true; 
                mySlots.push(i);
            }
            if (slots[i].cells.some((c) => c == cell.id)){
                mySlots.push(i);
            }
        }
        cells[index].slots = mySlots;
    });
    return cells; 
};