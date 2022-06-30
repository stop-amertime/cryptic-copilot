

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
type IDictionaryOrPromise = IDictionary | Promise<IDictionary>



interface IDictionaryEntry {
    isAbbreviation? : boolean,
    hash? : number,
    abbreviationFor? : Array<string>,
    score? : number,
    direction? : string,
    contains? : Array<IWord> 
}

// interface IThesaurusEntry {
// } 

interface IWord extends IDictionaryEntry {
    word: string
}

interface IDevice {
    words: Array<IWord>
    type?: "Anagram" | "Container" | "Charade" | "Multi",
    score?: number,
}

type IDeviceList = {type: string, list:IDevice[]};

type IDeviceSet = IDeviceList[];

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

type ISlotLetter = {
    letter: string,
    isOverwritable: boolean
}

interface ISlotProperties {
    letters : Array<ISlotLetter>,
    word? : string | null 
    //'word' seems odd but is separate conceptually:
    // WordSlot could have a bunch of letters, but not a valid word. 
    isNewWord : boolean
} 

interface IStateRecord {
    layout: IGridLayout 
    wordSlots: Array<IWordSlot>
    // Could add remembering the current selection?
    // For use by the file manager. 
}






