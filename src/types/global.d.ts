type SlotOrientation = 'A' | 'D';

type WordDirection = 'forward' | 'reverse' | 'anagram';

type detailsHeightTuple = [open: number, closed: number];

/* --------------------------------------------------------------------- Word */

type IDictEntry = {
	isAbbreviation?: boolean;
	hash?: number;
	abbreviationFor?: string;
	score?: number;
	direction?: string;
	contains?: Array<IWord>;
};

type IDictTuple = [string, IDictEntry];

type IWord = IDictEntry & {
	word: string;
	index?: number;
};

/* -----------------------------------------------     Dictionary & Thesaurus */

type IDictionary = Map<string, IDictEntry>;
type IWordHashMap = Map<number, string[]>;

type IThesaurusEntry = {
	partsOfSpeech: Array<IThesaurusPart>;
	numberOfSenses: number;
	abbreviationFor?: string;
};

type IThesaurusPart = {
	partOfSpeech: string;
	senses: Array<IThesaurusSense>;
};

type IThesaurusSense = {
	definition: string;
	synonyms: Array<IThesaurusSynonym>;
};

type IThesaurusSynonym = {
	mainWord: string;
	relatedWords: string[];
};

/* ---------------------------------------------------- Device (Set Of Words) */
type IDevice = {
	words: Array<IWord>;
	score?: number;
};

type IDeviceSet = {
	thesaurus?: IThesaurusEntry;
	anagrams?: IDevice[];
	containers?: IDevice[];
	hiddenwords?: IDevice[];
};

//= Grid

type IGridLayout = number[][];

type ICell = {
	id: number;
	isValid: boolean;
	isNumbered?: boolean;
	letter?: string;
	isSelected?: boolean;
	isHovered?: boolean;
	isImpossible?: boolean;
	slots: number[];
};

/* ----------------------------------------------------------------- WordSlot */

type IWordSlot = {
	number: number;
	orientation: SlotOrientation;
	clueIndex: string;
	len: number;
	cells: Array<number>;
	word: string | null;
	clue: string;
	intersections: ISlotIntersection[];
	isImpossible: boolean;
};

type ISlotIntersection = {
	slotId: number;
	myIndex: number;
	otherIndex: number;
};

type ICellState = {
	letter: string;
	isOverwritable: boolean;
};

type IMatchPredicate = [position: number, letter: string];

/* ------------------------------------------------------- Saving And Loading */

type IStateRecord = {
	layout?: IGridLayout;
	wordSlots?: Array<IWordSlot>;
};

/* -------------------------------------------- Event Messages To/from Worker */

type IWorkerTask<Input, Output> = {
	id?: number;
	request: string;
	payload?: Input;
	response?: Output;
	error?: string;
};

interface IWorkerPossibleWordsTask extends IWorkerTask<ICellState[], string[]> {
	request: 'possibleWords';
}

interface IWorkerDeviceTask extends IWorkerTask<string, IDeviceSet> {
	request: 'getDevices';
}

interface IWorkerDictionaryTask extends IWorkerTask<IDictionary, boolean> {
	request: 'setDictionary';
}
