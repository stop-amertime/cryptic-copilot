<script context="module" lang="ts">

import {writable} from 'svelte/store'
import {makeCells, makeWordSlots, mapCellsToSlots} from './modules/GridGenerator'
import {setDictionary} from './modules/ClueEngine'
import { subscribe } from 'svelte/internal';
import { Save } from './modules/FileManager';

/// Dictionary
export const dictionary = writable(null as IDictionary);

/// Grid 
export const gridTemplate = writable(null as IGridLayout);
export const wordSlots = writable(null as IWordSlot[]);
export const cells = writable([] as ICell[]);

/// Active Slot State
export const activeSlotId = writable(null as number);
export const activeSlotProps = writable(null as ISlotProperties);

</script>
<script lang="ts">

// @ new Dictionary -> set Dictionary
dictionary.subscribe( (dict) => { if(dict) setDictionary(dict)} );


// @ new Template -> intialise or load slots, cells. 
    gridTemplate.subscribe( (template) => initGrid(template));

/// @ new Word Entered -> update wordSlot & cells, save state. 
    activeSlotProps.subscribe( (slotProps) => {

        if ( slotProps && slotProps.isNewWord) {
            if ($activeSlotId === null) {console.log("NO SLOT SELECTED"); return;}
            $wordSlots[$activeSlotId].word = slotProps.word;
            updateSlotCellLetters( $wordSlots[$activeSlotId], slotProps.letters );
            Save.slots($wordSlots);
        }

        //TODO: Calcualate possibility of intersecting wordslots.
    });

// @ new Slot selected -> update Word Props, //! UPDATE DEVICES! 
    activeSlotId.subscribe( async (id : number) => {
        
        for (let cell of $cells){
            $cells[cell.id].isSelected = (cell.slots.includes(id));
        };
        setActiveSlotPropsToSlot(id);
    });


    // Functions.


    function initGrid(template: IGridLayout) {
        if (template){

            $cells = makeCells(template);
            if ($wordSlots) {    
                $wordSlots.forEach( (slot) => {
                    if (slot.word) updateSlotCellLetters(slot, slot.word)
                });
            }
            else {   
                $wordSlots = makeWordSlots(template); 
            }
            $cells = mapCellsToSlots($cells, $wordSlots);
        }
    } 

    function setActiveSlotPropsToSlot(slotId: number) :void {

        if (!slotId) {return;}

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

        $activeSlotProps = {
            "letters": letters,
            "word": slot.word,
            "isNewWord": false 
            //this event comes from selecting an existing wordSlot, 
            //so not a 'new' word.  
        }
    }


    function updateSlotCellLetters(slot: IWordSlot, wordOrLetterArray: ISlotLetter[] | string) {
        
        if (typeof wordOrLetterArray == "string"){
            for (let i = 0; i < slot.cells.length; i++) {
                    let cellId = slot.cells[i];
                    $cells[cellId].letter = slot.word[i];
                }
        }

        else {
                console.log("Updating Slot Cell Letters...");
                for (let i = 0; i < slot.cells.length; i++) {
                if (wordOrLetterArray[i].isOverwritable){
                    let cellId = slot.cells[i];
                    $cells[cellId].letter = wordOrLetterArray[i].letter;
                }
            } 
        }  
    }

    
</script>




