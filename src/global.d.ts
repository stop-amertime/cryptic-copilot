

const enum SlotOrientation {
    Across = "A",
    Down = "D"
}

const enum WordDirection {
    Forward = "word",
    Reverse = "word reverse",
    Anagram = "word anagram"
}

type IDictionary = Map<string, IDictionaryEntry> 
type IGridLayout = Array<Array<number>> 

type IDictionaryOrPromise = IDictionary | Promise<IDictionary>
type IGridLayoutOrPromise = IGridLayout | Promise<IGridLayout> 

interface IDictionaryEntry {
    isAbbreviation? : boolean,
    hash? : number,
    abbreviationFor? : Array<string>,
    score? : number,
    direction? : string,
    contains? : Array<IWord> 
}

interface IWord extends IDictionaryEntry {
    word: string
}

interface IDevice {
    words: Array<IWord>
    type: "Anagram" | "Container" | "Charade" | "Multi",
    score: number,
}

type IWordSlot = {
    number : number,
    orientation: SlotOrientation,
    clueIndex : string,
    len: number, 
    cells: Array<number>,
    word: string | null, 
    clue: string
}

type ICell = {
    id: number,
    isValid: boolean,
    isNumbered?: boolean,
    letter?: string, 
    isSelected?: boolean,
    isHovered?: boolean,
    slots: Array<number>
}

type ISlotLetter = {
    letter: string,
    isOverwritable: boolean
}

interface ISlotWord {
    letters : Array<ISlotLetter>,
    word? : string | null 
    //'word' seems odd but is separate conceptually:
    // WordSlot could have a bunch of letters, but not a valid word. 
    isNewWord : boolean
} 

interface IStateRecord { 
    cells: Array<Cell>
    wordSlots: Array<IWordSlot>
    // Could add remembering the current selection?
    // For use by the file manager. 
}

interface IDeviceList {
    anagrams?: Array<any>
    containers?: Array<any>
    charades?: Array<any>
    definitions?: Array<any> 
    hiddenwords?: Array<any>
}







