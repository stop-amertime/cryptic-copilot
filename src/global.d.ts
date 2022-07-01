

const enum SlotOrientation {
    Across = "A",
    Down = "D"
}

const enum WordDirection {
    Forward = "",
    Reverse = "reverse",
    Anagram = "anagram"
}

//= Word 

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

//= Dictionary & Thesaurus 

type IDictionary = Map<string, IDictionaryEntry> 
type IDictionaryOrPromise = IDictionary | Promise<IDictionary>

// interface IThesaurusEntry {
// !LOOK BACK IN PREV FORMATTER CODE FOR STRUCTURE 
// } 

//= Device (Set of Words)

interface IDevice {
    words: Array<IWord>
    score?: number
}
    
interface IDeviceSet {
    anagrams?: IDevice[]
    containers? : IDevice[]
    hiddenwords? : IDevice[]
};

type IDeviceSetOrPromise = IDeviceSet | Promise<IDeviceSet>

//= Grid 

type IGridLayout = number[][];

type IGridLayoutOrPromise = IGridLayout | Promise<IGridLayout>;

type ICell = {
    id: number,
    isValid: boolean,
    isNumbered?: boolean,
    letter?: string, 
    isSelected?: boolean,
    isHovered?: boolean,
    slots: number[]
}

//= WordSlot 

type IWordSlot = {
    number : number,
    orientation: SlotOrientation,
    clueIndex : string,
    len: number, 
    cells: Array<number>,
    word: string | null, 
    clue: string
}

type ISlotCellState = {
    letter: string,
    isOverwritable: boolean
}

type ISlotCellStates = ISlotCellState[];

//= Saving and Loading

interface IStateRecord {
    layout: IGridLayout 
    wordSlots: Array<IWordSlot>
    // Could add remembering the current selection?
}






