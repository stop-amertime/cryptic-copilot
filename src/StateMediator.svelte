<script context="module" lang="ts">

/*---------------------------------------------------*/
import {writable, derived} from 'svelte/store'
import {makeCells, makeWordSlots, mapCellsToSlots} from './modules/GridGenerator'
import {setDictionary} from './modules/ClueEngine'
import { Save } from './modules/FileManager';
/*---------------------------------------------------*/

//======= MAIN STORES 

/// Dictionary
export const dictionary = writable(null as IDictionary);

/// Grid 
export const gridTemplate = writable(null as IGridLayout);
export const wordSlots = writable(null as IWordSlot[]);
export const cells = writable([] as ICell[]);

/// Active Slot State
export const activeSlotId = writable(null as number);
export const activeWord = writable(null as string);
export const activeCells = writable(null as ISlotCellStates);
export const activeCellAnimations = writable({orientation: "A",order:{}});
export const activeDeviceList = writable([] as IDeviceSet)
export const activePossibleWords = writable([] as string[])
</script>

<script lang="ts">

/////////////////////======== EVENTS

// @ new Dictionary -> set Dictionary
dictionary.subscribe( (dict) => { if(dict) setDictionary(dict)} );


// @ new Template -> intialise or load slots, cells. 
gridTemplate.subscribe( (template) => initGrid(template));

//TODO: Reload/calculate possible words & devices on CHANGE slot. 
//TODO: Calculate possible words centrally on NEW WORD. 


// @ new Word Entered -> update wordSlot & cells, save state. 
activeWord.subscribe( (newWord: string) => {

    if ($activeSlotId === null) {return;}
    $wordSlots[$activeSlotId].word = newWord;

    /// Update Cells. 
    let updatedCells = calculateUpdatedCells(newWord)
    activeCells.set(updatedCells);
    refreshGridLetters($wordSlots[$activeSlotId], updatedCells );

    //Quicksave 
    Save.slots($wordSlots);
    //TODO: Calcualate possibility of intersecting wordslots.
});

// @ new Slot selected -> 
activeSlotId.subscribe( async (id : number) => {

    highlightSlotCells(id);
    refreshActiveSlotProps(id);
    refreshOrGetDevices(id);
    refreshOrGetPossibleWords(id);

});

    // Functions.

function initGrid(template: IGridLayout) {
    if (template){

        $cells = makeCells(template);
        if ($wordSlots) {    
            $wordSlots.forEach( (slot) => {
                if (slot.word) {loadGridLetters(slot, slot.word);}
            });
        }
        else {   
            $wordSlots = makeWordSlots(template); 
        }
        $cells = mapCellsToSlots($cells, $wordSlots);
    }
} 

function refreshActiveSlotProps(slotId: number) :void {

    if (!slotId || !$wordSlots[slotId]) {return;}
    let slot = $wordSlots?.[slotId] as IWordSlot;
    let mycells = [] as ISlotCellState[];
    let i = 0; 
    let animationOrder = {};

    for (let cellId of slot?.cells || []) {
        let isOverwritable = true; 
        
        //check the cells slots, to see if it is shared with another slot 
        let sharedSlotId =  $cells[cellId].slots.find(c => c!=slotId);  

        //If slot has a valid word in it, That letter is not overwritable. 
        if (sharedSlotId!==undefined && $wordSlots[sharedSlotId].word){ 
            isOverwritable = false;                       
        }

        mycells.push({
            letter: $cells[cellId].letter, 
            isOverwritable
        });

    };
    $activeWord = slot?.word || null;
    $activeCells = mycells;
    $activeCellAnimations = {order: animationOrder, orientation: slot?.orientation}; 
};

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
            if (cellStates[i].isOverwritable){
                let cellId = slot.cells[i];
                if ($cells[cellId].letter != cellStates[i].letter){
                    $activeCellAnimations.order[cellId] = animOrder;
                    animOrder++
                    $cells[cellId].letter = cellStates[i].letter;
                }
            }
        }
    $cells = $cells;
}

function calculateUpdatedCells(newWord:string): ISlotCellStates{
    return $activeCells.map( (cellOfSlot, i) => {
        return cellOfSlot.isOverwritable 
            ? {...cellOfSlot, letter: newWord?.[i] || ''} 
            : cellOfSlot
    });
}

function highlightSlotCells(id:number): void {
    for (let cell of $cells){
        $cells[cell.id].isSelected = (cell.slots.includes(id));
    };
}

function refreshOrGetDevices(id){
}

function refreshOrGetPossibleWords(id){
}
    
</script>




