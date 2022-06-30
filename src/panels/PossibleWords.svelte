<script lang="ts">

/*-------------------------------------*/
import { derived, writable } from "svelte/store";
import VirtualList from "@sveltejs/svelte-virtual-list";
import { activeSlotProps } from "../StateMediator.svelte";
import { validWordFinder } from '../modules/ClueEngine';
import { fly } from 'svelte/transition'
import IconButton from "./subcomponents/IconButton.svelte";
import LetterBoxes from "./subcomponents/LetterBoxes.svelte";
/*-------------------------------------*/


let rawSearchInput = writable("");
let possibleWords = writable([]);
let searchletters = [];
$: isValidWord = $activeSlotProps?.word ? true : false;
$: isValidSearch = false;
$: userSearchMessage = "";

let searchInput = derived( rawSearchInput, (string) => {
    if (string) {return string.toUpperCase().replaceAll( /[^A-Z]/g , "")}
    else {return ""};
});

let filteredPossibleWords = derived( [possibleWords, searchInput] , () => {
    return ($searchInput) 
    ? $possibleWords.filter( w => w.includes($searchInput))
    : $possibleWords;
});

searchInput.subscribe( (string) => {
    [isValidSearch, userSearchMessage] = validWordFinder.checkValidNewWord(string, searchletters)
});

activeSlotProps.subscribe( (slotProps) => {
    if (slotProps){
        let newsearchletters = [];
        for (let slotletter of slotProps.letters){
            newsearchletters.push( slotletter.isOverwritable ? '.' : slotletter.letter)
        }
        searchletters = newsearchletters;
        $possibleWords = validWordFinder.search(searchletters)
        $rawSearchInput = "";
    }
});

function setNewWord(word: string) : void {
    
    activeSlotProps.update( (prevstate) => {
        
        for (let i = 0; i<prevstate.letters.length; i++){
            if (prevstate.letters[i].isOverwritable) {
                prevstate.letters[i].letter = (word) ? word[i] : ''
            }
        }

        return  {
        "word": word,
        "isNewWord": true,
        "letters": prevstate.letters
        } as ISlotProperties;
    });

}

</script>

{#if $activeSlotProps}
<div id="wrapper">

    <div id="topArea">

        <LetterBoxes letters={$activeSlotProps.letters}/>

        <IconButton id="resetbutton" url="/src/assets/icons/deletebin.png" 
        disabled={!isValidWord} on:clicked={() => setNewWord(null)}/>

        <input id="searchInput" bind:value={$rawSearchInput}
            placeholder="🔎︎  Search or add a new word.."/>

        <IconButton id="searchSubmit" url="/src/assets/icons/addtext.png" 
        disabled={!isValidSearch} on:clicked={() => setNewWord($searchInput)}/>

        <span id="matchText"> {$filteredPossibleWords.length} matching words. </span>

    </div>

    {#if $filteredPossibleWords && $filteredPossibleWords.length > 0}

        <div id="possibleWordsWrapper">
            
            <VirtualList 
            items={$filteredPossibleWords} 
            let:item>

                <button 
                    class="possibleWord" 
                    on:click={() => setNewWord(item)}>
                    {item}
                </button>

            </VirtualList>
        </div>

    {:else}
        <div id="noPossibleWords">

            <img 
                id="noWordsIcon" 
                src="/src/assets/icons/nomatches.png" 
                alt="No matching words.">

            {#if $searchInput}
            <span 
                id="noWordsText" 
                class={isValidSearch? "y" : "n"}>
                {userSearchMessage}
            </span>
            {/if}

        </div>
    {/if}

</div>

{:else }

<div> No word selected. </div>

{/if}

<style>

    #wrapper {
        display: block;
        height: 100%;
        width: 100%;
    }

    #topArea {
        height: 200px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 60px;
        grid-template-rows: repeat(2, 60px) 40px;
        grid-column-gap: 15px;
        grid-row-gap: 20px;
    }

    #possibleWordsWrapper {
        flex: 1 0 auto; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 200px);
        overflow: auto;
    }

    .possibleWord {
        background-color: aliceblue;
        margin: 5px;
        padding: 5px;
        width: 70%;
        text-align: center;
        border-radius: 3px;
        border: 1px solid blue;
        cursor: pointer;
    }

    .possibleWord:hover{
        background-color: aqua;
    }

    .possibleWord:focus{
        background-color:whitesmoke;
    }

    #noPossibleWords {
        flex: 1 0 auto; 
        display:flex;
        flex-direction: column;
        min-height: 200px;
        width: 100%;
        height: calc(100% - 200px);
        overflow: auto;
        justify-content: center;
        align-items: center;
    }

    #noWordsIcon {
        width: 50px;
        height: 50px;
    }

    #noWordsText {
        margin: 20px;
        font-weight: bold;
    }

    #noWordsText.y {
        color: green;
    }

    #noWordsText.n {
        color: orangered;
    }

</style>
