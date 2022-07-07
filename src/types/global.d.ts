const enum SlotOrientation {
	Across = 'A',
	Down = 'D',
}

const enum WordDirection {
	Forward = '',
	Reverse = 'reverse',
	Anagram = 'anagram',
}

type detailsHeightTuple = [open: number, closed: number];

//= Word

type IDictionaryEntry = {
	isAbbreviation?: boolean;
	hash?: number;
	abbreviationFor?: Array<string>;
	score?: number;
	direction?: string;
	contains?: Array<IWord>;
}

type IWord = IDictionaryEntry & {
	word: string;
}

//= Dictionary & Thesaurus

type IDictionary = Map<string, IDictionaryEntry>;

type IThesaurusEntry = {
    partsOfSpeech: Array<IThesaurusPart>
    numberOfSenses: number
    abbreviationFor?: string[]
}

type IThesaurusPart = {
    partOfSpeech: string
    senses: Array<IThesaurusSense>
}

type IThesaurusSense = {
    definition: string,
    synonyms: Array<IThesaurusSynonym>
}

type IThesaurusSynonym = {
    mainWord: string;
    relatedWords: string[]
}

//= Device (Set of Words)
//todo: Do I need to include the score here, or just sort?
type IDevice = {
	words: Array<IWord>;
	score?: number;
}

type IDeviceSet = {
    thesaurus?: IThesaurusEntry;
	anagrams?: IDevice[];
	containers?: IDevice[];
	hiddenwords?: IDevice[];
}

//= Grid

type IGridLayout = number[][];

type ICell = {
	id: number;
	isValid: boolean;
	isNumbered?: boolean;
	letter?: string;
	isSelected?: boolean;
	isHovered?: boolean;
	slots: number[];
};

//= WordSlot

type IWordSlot = {
	number: number;
	orientation: SlotOrientation;
	clueIndex: string;
	len: number;
	cells: Array<number>;
	word: string | null;
	clue: string;
};

type ISlotCellState = {
	letter: string;
	isOverwritable: boolean;
};

//= Saving and Loading

interface IStateRecord {
	layout: IGridLayout;
	wordSlots?: Array<IWordSlot>;
	// Could add remembering the current selection?
}

//= Event Messages to/from Worker

type IWorkerTask<Input, Output> = {
	id?: number;
	request: string;
	payload?: Input;
	response?: Output;
	error?: string;
}

interface IWorkerPossibleWordsTask
	extends IWorkerTask<ISlotCellState[], string[]> {
	request: 'possibleWords';
}

interface IWorkerDeviceTask extends IWorkerTask<string, IDeviceSet> {
	request: 'getDevices';
}

interface IWorkerDictionaryTask extends IWorkerTask<IDictionary, boolean> {
	request: 'setDictionary';
}
