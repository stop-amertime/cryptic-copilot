<script lang="ts">

import { writable } from 'svelte/store';
import Cell from './Cell.svelte';
import { wordSlots, selectedSlotWord, selectedSlotId } from './stores';
import {fade} from 'svelte/transition'
export let gridTemplate;
let rowsize, numcells; 

let cells = writable([] as Array<ICell>);
let i=0;

$: rowsize = gridTemplate[0].length;
$: numcells = rowsize * rowsize;
makeCells(gridTemplate)
makeWordSlots(gridTemplate);

//////// INIT 

function makeCells(gridTemplate){
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
    $cells = calc_cells;
}

function makeWordSlots(gridTemplate) {

    if (!$wordSlots || $wordSlots.length == 0){
    
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
                        $cells[xytocell(r,c)].isNumbered = true;

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
                        
                        $cells[xytocell(r,c)].isNumbered = true;

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
        $wordSlots = temp_wordSlots;
    }

    // Update each cell with the slots it occupies. 
    $cells.forEach( (cell,index) => {

        let mySlots = [];
        for(i = 0; i < $wordSlots.length; i++){
            if ($wordSlots[i].cells.some((c) => c == cell.id)){
                mySlots.push(i);
            }
        }
        $cells[index].slots = mySlots;
    });
};


//LOGGING THE SLOTS, SLOTSOFCELL AND CELLS 
    // console.groupCollapsed("wordSlots");
    // console.table($wordSlots);
    // console.groupEnd();

    // console.groupCollapsed("cells");
    // console.table($cells);
    // console.groupEnd();
//


// A cell is clicked - select the appropriate wordSlot. 
function updateSelectedSlot(event: {detail: Array<number> }){

    let slotIds = event.detail; 
    if (slotIds ==null || slotIds.length<1) {return;}

    // If multiple slots for that cell, toggle between. 
    if (slotIds.length >= 2){ 
            $selectedSlotId = $selectedSlotId == slotIds[0] ? 
                slotIds[1]
                :slotIds[0]
    }

    // If cell has only 1 slot, select it if not already selected. 
    else if (slotIds.length == 1 && $selectedSlotId != slotIds[0]){
        $selectedSlotId = slotIds[0]
    }
}

// @selectedSlotId --> Highlight correct cells when wordSlot is selected. 
selectedSlotId.subscribe( (id: number) => {
    if (id!=null){
        highlightSlotCells(id);
        updateSlotWord(id);
    }
});

function highlightSlotCells(slotId: number) :void{
        for (let cell of $cells){
            $cells[cell.id].isSelected = (cell.slots.includes(slotId));
        };
}

function updateSlotWord(slotId: number) :void {

    let slot = $wordSlots[slotId] as IWordSlot;
    if (!slot.cells) {return;}
    let letters = [];
    let mycells = slot.cells;

    mycells.forEach( (cellId, index) => //Iterate to find the slots letters. 
        {
            let letter = $cells[cellId].letter;
            let isOverwritable = true; 

            let cellslots = $cells[cellId].slots;          //Find the slots of that cell
            let sharedSlotId = cellslots.find(c => c!=slotId); //See if the cell is shared with another slot.  
            
            if (sharedSlotId!==undefined && $wordSlots[sharedSlotId].word){ //If slot has a valid word in it, 
                isOverwritable = false;                        //That letter is not overwritable. 
            }

            letters.push({letter, isOverwritable} as ISlotLetter);
        });

    $selectedSlotWord = {
        "letters": letters,
        "word": slot.word,
        "isNewWord": false 
        //this event comes from selecting an existing wordSlot, 
        //so not a 'new' word.  
    }
}


// @selectedSlotWord --> If a new word is entered, update cells and wordSlot. 
selectedSlotWord.subscribe( slotword => {
    if (slotword && slotword.isNewWord) {
        updateGridWithNewWord(slotword.word) 
    }
});

function updateGridWithNewWord (word) {

    if ($selectedSlotId === null) {return;}
    $wordSlots[$selectedSlotId].word = word;

    let editedcells = $wordSlots[$selectedSlotId].cells;
    let tmp = $cells;

    //If a valid word is being entered, update letters. 
    //If it is a null word, reset letters. 

    if (word){ 

        if (word.length != editedcells.length) {
            console.error("Incorrect Length"); 
            return;
        }

        for (let i=0; i<editedcells.length; i++){
            tmp[editedcells[i]].letter = word[i];
        };
    }

    else {  
        for (let i=0; i<editedcells.length; i++){
            tmp[editedcells[i]].letter = '';
        };
    }
    cells.set(tmp);
}
    //TODO: Calcualate possibility of intersecting wordslots.

</script>

        <div id="Grid"
        transition:fade={{duration:1000}}
        style="--dimension:{rowsize}">

        {#each $cells as cell}
                <Cell {...cell} on:clicked={updateSelectedSlot}></Cell>
        {/each}

    </div>

<style>

    * {
        box-sizing:border-box;
    }

    #Grid{
        aspect-ratio: 1;
        display: grid;
        grid-template-columns: repeat(var(--dimension),1fr);
        grid-template-rows: repeat(var(--dimension),1fr);
    }

</style>

