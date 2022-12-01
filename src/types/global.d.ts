type SlotOrientation = "A" | "D";

type WordDirection = "forward" | "reverse" | "anagram";

type detailsHeightTuple = [open: number, closed: number];

type ILoadProtocol<T> = {
	parse: (x: string) => T;
	getDefault: () => Promise<string>;
};
type ILoadItem<T> = [key: string, loadProtocol: ILoadProtocol<T>];
type ILoadItemSet<T> = ILoadItem<T[keyof T]>[];

interface GlobalData {
	dictionary?: IDictionary;
	defaultLayouts?: IGridLayout[];
	priorityWords?: string[];
}

interface UserStateData {
	wordSlots?: IWordSlot[];
	layout?: IGridLayout;
	cells?: ICell[];
}

type InitData = {
	dictionary?: IDictionary;
	defaultLayouts?: IGridLayout[];
	priorityWords?: string[];
	wordSlots?: IWordSlot[];
	layout?: IGridLayout;
	cells?: ICell[];
};
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

type DatamuseWord = {
	word: string;
	score: number;
	numSyllables: number;
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
	hiddenwords?: IHiddenWord[];
	soundslike?: IWord[];
	substitutions?: ISubstitutionGrouped;
};

type IHiddenWord = {
	start: string;
	middle?: string;
	end: string;
	a: string[];
	b: string[];
};

type ISubstitution = {
	deleted: IWord;
	replacedBy?: IWord;
	index: number;
	finalWord: IWord;
};

type ISubstitutionPair = {
	replacedBy?: IWord;
	index: number;
	finalWord: IWord;
};

type ISubstitutionGrouped = Map<IWord, ISubstitutionPair[]>;

type nestedWord = { word: string; index: number };

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
	id: number;
	letter: string;
	isOverwritable: boolean;
};

type IBoundingBox = {
	top: number;
	left: number;
	width: number;
	height: number;
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
	request: "possibleWords";
}

interface IWorkerDeviceTask extends IWorkerTask<string, IDeviceSet> {
	request: "getDevices";
}

interface IWorkerDictionaryTask extends IWorkerTask<IDictionary, boolean> {
	request: "setDictionary";
}
