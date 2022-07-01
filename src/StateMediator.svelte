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
export const activeSlotWord = writable(null as string);
export const activeSlotCells = writable(null as ISlotCellStates);

</script>
<script lang="ts">

/////////////////////======== EVENTS

// @ new Dictionary -> set Dictionary
dictionary.subscribe( (dict) => { if(dict) setDictionary(dict)} );


// @ new Template -> intialise or load slots, cells. 
gridTemplate.subscribe( (template) => initGrid(template));

// @ new Word Entered -> update wordSlot & cells, save state. 
activeSlotWord.subscribe( (newWord: string) => {

        if ($activeSlotId === null) {console.log("NO SLOT SELECTED"); return;}

        $wordSlots[$activeSlotId].word = newWord;

        /// Find and replace overwritable letters to retain state of other slots. 
        let updatedCells = $activeSlotCells.map( (cellOfSlot, i) => {
            return cellOfSlot.isOverwritable 
                ? {...cellOfSlot, letter: newWord?.[i] || ''} 
                : cellOfSlot
        });

        $activeSlotCells = updatedCells;
        refreshGridLetters( $wordSlots[$activeSlotId], updatedCells );

        Save.slots($wordSlots);

    //TODO: Calcualate possibility of intersecting wordslots.
});

// @ new Slot selected -> refresh Word Props, Devices 
    activeSlotId.subscribe( async (id : number) => {
        
        for (let cell of $cells){
            $cells[cell.id].isSelected = (cell.slots.includes(id));
        };
        refreshActiveSlotProps(id);

    });


    // Functions.

    function initGrid(template: IGridLayout) {
        if (template){

            $cells = makeCells(template);
            if ($wordSlots) {    
                $wordSlots.forEach( (slot) => {
                    if (slot.word) {refreshGridLetters(slot, slot.word);}
                });
            }
            else {   
                $wordSlots = makeWordSlots(template); 
            }
            $cells = mapCellsToSlots($cells, $wordSlots);
        }
    } 

    function refreshActiveSlotProps(slotId: number) :void {

        if (!slotId) {return;}
        let slot = $wordSlots[slotId] as IWordSlot;
        if (!slot?.cells) {return;}
        let mycells = [] as ISlotCellState[];

        for (let cellId of slot.cells) {
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

        $activeSlotWord = slot.word;
        $activeSlotCells = mycells;
    };

    function refreshGridLetters(slot: IWordSlot, wordOrCellStates: string | ISlotCellState[]) {
        
        if (typeof wordOrCellStates == "string"){
            for (let i = 0; i < slot.cells.length; i++) {
                    let cellId = slot.cells[i];
                    $cells[cellId].letter = slot.word[i];
                }
        }

        else {
                for (let i = 0; i < slot.cells.length; i++) {
                if (wordOrCellStates[i].isOverwritable){
                    let cellId = slot.cells[i];
                    $cells[cellId].letter = wordOrCellStates[i].letter;
                }
            } 
        }
        $cells = $cells;  
    }

    
</script>




