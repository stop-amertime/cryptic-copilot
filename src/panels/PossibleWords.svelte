<script lang="ts">

    import { writable } from "svelte/store";
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import { selectedSlotWord } from "../stores";
    import { validWordFinder } from '../modules/ClueEngine';
    import { fly } from 'svelte/transition'

    let searchInput = writable("");

    let possibleWords = writable([]);

    selectedSlotWord.subscribe( (slotWord) => {
        if (slotWord){
            let searchletters = []
            for (let slotletter of slotWord.letters){
                searchletters.push( slotletter.isOverwritable ? '.' : slotletter.letter)
            }
            $possibleWords = validWordFinder.search(searchletters)
        }
    });

    function setNewWord(word: string) : void {
        
        let newLetters = Array.from(word);
        
        selectedSlotWord.update( (prevstate) => {
            
            let updatedSlotLetters = prevstate.letters.map( 
                (prev,index) => prev = {...prev, "letter": newLetters[index]} as ISlotLetter)

            return  {"word": word, "isNewWord": true, "letters": updatedSlotLetters} as ISlotWord;
        });
    }

</script>

<!-- ///////////////   HTML   /////////////////// -->
{#if $selectedSlotWord}
<div id="wrapper">

    <div id="topArea">
        <div id="letterBox">
            {#each $selectedSlotWord.letters as l}
                <div 
                style="--number: {$selectedSlotWord.letters.length}" 
                class="letter {l.isOverwritable ? '' : "fixed"}"
                in:fly={{duration:100}}>
                    <svg 
                    width="100%"
                    height="100%"
                    viewBox="0 -50 50 50"
                    preserveAspectRatio="true">
                        <text x="0" y="0">
                            {l.letter}
                        </text>
                </div>
            {/each}
        </div>

        <button
        id="resetbutton"
        class="smallbutton"
        on:click={() => ($selectedSlotWord = null)}>
            <img src="/src/assets/icons/deletebin.png" alt="Delete this word."/>
        </button>

        <input
            id="searchInput"
            bind:value={$searchInput}
            placeholder="🔎︎  Search or add a new word.."
        />
        <button id="searchSubmit" class="smallbutton">
            <img src="/src/assets/icons/addtext.png" alt="Delete this word."/>
        </button>


        <span id="matchText"> {$possibleWords.length} matching words. </span>

    </div>


    <div id="possibleWordsWrapper">
        <VirtualList items={$possibleWords} let:item>
            <button class="possibleWord" on:click={() => setNewWord(item)}>
                {item}
            </button>
        </VirtualList>
    </div>
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

    #letterBox {
        grid-area: 1 / 1 / 2 / 2;
        display: block;
        /* flex-direction: row;
        flex-wrap: nowrap;
        justify-items: center;
        align-items: stretch; */
    }

    .letter {
        display: inline-block;
        border: 1px solid black;
        box-shadow: 2px 3px 8px grey;
        padding: 4px;
        margin: 3px; 
        width: 6%;
        aspect-ratio: 1;
    }

    .letter > svg > text {
        font-size: 500%;
        font-weight: bold;
    }

    .fixed {
        background-color: grey;
        opacity: 0.7;
    }  

    #resetbutton {
        grid-area: 1 / 2 / 2 / 3;
        object-fit: cover;        
    }

    .smallbutton > img{
        object-fit: cover;
        width: 100%;
        height: 100%;
    }

    #searchInput {
        grid-area: 2 / 1 / 3 / 2;
        margin: 10px 0px 10px 0px;
        padding-left: 20px;
    }
    #searchSubmit {
        grid-area: 2 / 2 / 3 / 3;
    }
    #matchText {
        grid-area: 3 / 1 / 4 / 3;
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

</style>
