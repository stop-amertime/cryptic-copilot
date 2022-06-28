// @ts-nocheck
import LZString from 'lz-string'

//== SETTINGS 
let DICT_VERSION = 'dict-4.0';
let DICT_SAVECOMPRESSION = 'compressed';
let DICT_CACHECOMPRESSION = 'minified';
let DICT_URL = {
    'raw': `./src/data/${DICT_VERSION}.json`,
    'minified': `./src/data/${DICT_VERSION}.min.txt`,
    'compressed': `./src/data/${DICT_VERSION}.lz.txt`
};

//== VARIABLES
let currentDictionary = localStorage.getItem('dictionary') || null;
let currentState = localStorage.getItem('state') || null;
let currentLayout = JSON.parse(localStorage.getItem('currentLayout')) || null;
let defaultLayoutURL = "./src/data/gridtemplates.json";

let activeFile = null;

// if (currentState){
//     //loadState(JSON.parse(currentState));
// }
// else {              // Load default blank layout //____ EDIT: TO CACHE 'DEFAULT' LAYOUT TOO.


function stringifyState(slots) {

    ///// RIP THIS OUT... 
    ////// MUST RELOAD STATE OF: 
    /////////// cells
    /////////// wordSlots
    /////////// wordSlotData (?)

    let wordSlots = [];
    slots.forEach((s, index) => {
        wordSlots[index] = { "word": s.word || null, "clueText": s.clueText };
    });

    return JSON.stringify({ "layout": currentLayout, "wordSlots": wordSlots });
}

function stringifyDictionary(dictionary, compression = "compressed") {

    switch (compression) {
        case "raw": return JSON.stringify(Array.from(dictionary.entries()));

        case "minified": return minifyDictionary(dictionary);

        case "compressed": return LZString.compressToUTF16(minifyDictionary(dictionary));

        default: console.error("Incorrect Compression Level Entered!!");
    }
}

function minifyDictionary(dictionary) {
    let string = "";
    for (let [key, value] of dictionary) {
        if (value.defs) {
            string += `${key} ${value.score} ${value.hash};${value.defs.join()}#`;
        }
        else {
            string += `${key} ${value.score} ${value.hash}#`;
        }
    }
    return string;
}

function parseAndLoadDictionary(string: string, compression = "raw") {

    switch (compression) {
        case "raw": return new Map(JSON.parse(string)) as IDictionary;

        case "minified": return unminifyDictionary(string);

        case "compressed": return unminifyDictionary(LZString.decompressFromUTF16(string));

        default: console.error('Unable to decompress dictionary!!');
    }
}

function unminifyDictionary(minifiedstring: string) {

    let temp_DICTIONARY = new Map() as IDictionary;
    let wordarray = minifiedstring.split('#');
    for (let parsestring of wordarray) {

        let isAbbreviation = false; 
        if (parsestring.includes(';') ) {let isAbbreviation = true};

        parsestring = parsestring.split(';'); // is array ["key&props","defs"]

        let proparray = parsestring[0].split(' '); //  is [key,t(ype),score,hash]

        let wordobject = { isAbbreviation, "score": proparray[2], "hash": proparray[3] } as IWordProperties;

        if (parsestring.length > 1) { wordobject["abbreviationFor"] = parsestring[1].split(',') }

        temp_DICTIONARY.set(proparray[0], wordobject);
    }
    return temp_DICTIONARY;
}


export const Load = {

    lastOrDefaultLayout: async () => {

        // CURRENTLY DOESN'T CACHE LAYOUT... 
        let response = await fetch(defaultLayoutURL);
        let template = await response.json();

        currentLayout = template;
        localStorage.setItem('currentLayout', JSON.stringify(currentLayout));

        return currentLayout;
    },

    lastOrDefaultDictionary: async () => {

        if (currentDictionary) {
            return unminifyDictionary(currentDictionary);
        }

        else {

            let response = await fetch(DICT_URL[DICT_SAVECOMPRESSION])
            let fetchedString = await response.text();

            let temp_dictionary = parseAndLoadDictionary(fetchedString);
            localStorage.setItem('dictionary', stringifyDictionary(temp_dictionary));
            return temp_dictionary; 
        }
    },

    StateFromFile: async function () {
        [activeFile] = await window.showOpenFilePicker();
        const file = await activeFile.getFile();
        const loadedFile = await file.text();
        let StateFile = JSON.parse(loadedFile);

        // Import the Grid Layout
        //Grid.loadState(StateFile, false);
    }
}

export const Save = {

    state : async () => {

        console.log('Saving state..');
        localStorage.setItem('state', stringifyState());

        if (activeFile) {
            const writableStream = await activeFile.createWritable();
            await writableStream.write(stringifyState());
            await writableStream.close();
        }
    },

    StateToFile: async () => {

        const saveOptions =
        {
            types: [
                {
                    description: 'Crossword File',
                    accept: { 'application/json': ['.cw'] },
                }],
        };
        activeFile = await window.showSaveFilePicker(saveOptions);
        const writableStream = await activeFile.createWritable();
        await writableStream.write(stringifyState());
        await writableStream.close();
    }
}

