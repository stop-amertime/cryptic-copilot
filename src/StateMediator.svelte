<script context="module" lang="ts">

/*---------------------------------------------------*/
import {writable, derived} from 'svelte/store'
import {makeCells, makeWordSlots, mapCellsToSlots} from './lib/GridGenerator'
import {setDictionary} from './lib/ClueEngine'
import { Save } from './lib/FileManager';
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
export const activeDeviceList = writable(Promise.resolve([]) as Promise<IDeviceSet>);
export const activePossibleWords = writable((Promise.resolve([])) as Promise<string[]>);

</script>

<script lang="ts">

///////////======= ASYNC WORKER MANAGEMENT. 

let workerPromises = {};
let nonce = 0;
let dictionaryValid = null;
const WordWorker = new Worker(new URL('./lib/WordWorker', import.meta.url),{type:"module"});

const workerRequest = (request: string, payload: any) => {
    let id = ++nonce; 
    console.log(`Posting request to worker- id:${id} request:${request} payload:${payload}`);
    WordWorker.postMessage({ id, request, payload});
    return new Promise(function(resolve,reject){
        let resolver = resolve;
        let rejecter = reject;
        workerPromises[id] = {resolver, rejecter};
    })
}

WordWorker.onmessage = (event) => {

    let {id, response, error} = event.data;
    if (!workerPromises[id]) {console.error("Invalid ID Reply from Worker" + id); return}

    if (error) {
        workerPromises[id].rejecter(error)
    }

    else {
        workerPromises[id].resolver(response)
    }
    delete workerPromises[id];
}

/////////////////////======== EVENTS


// @ new Template -> intialise or load slots, cells. 
gridTemplate.subscribe( (template) => initGrid(template));

// @ new Dictionary -> set Dictionary
dictionary.subscribe( (dict) => { 
    if(dict) {
        setDictionary(dict);
        let validDictionary = workerRequest('setDictionary',$dictionary)
        validDictionary.then((r) => console.log("Worker Dictionary Update: " + r));
    }
});

function requestWorkerDevices(word: string){
    $activeDeviceList = workerRequest('getDevices', word)
}


// @ new Word Entered -> update wordSlot & cells, save state. 
activeWord.subscribe( (newWord: string) => {

    if ($activeSlotId === null) {return;}
    $wordSlots[$activeSlotId].word = newWord;

    /// Update Cells. 
    let updatedCells = calculateUpdatedCells(newWord)
    activeCells.set(updatedCells);
    refreshGridLetters($wordSlots[$activeSlotId], updatedCells );
    $activeDeviceList = workerRequest('getDevices', newWord) as Promise<IDeviceSet>

    //Quicksave 
    Save.slots($wordSlots);
});

// @ new Slot selected -> 
activeSlotId.subscribe( async (id : number) => {
    highlightSlotCells(id);
    refreshActiveSlotProps(id);
    $activePossibleWords = workerRequest('getPossibleWords', $activeCells) as Promise<string[]>
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
    $activeCellAnimations = {order: {}, orientation: slot?.orientation}; 
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




