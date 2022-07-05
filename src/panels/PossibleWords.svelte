<script lang="ts">
//
    import {fade, fly, slide, SlideParams} from 'svelte/transition'
    import {slideReplaceIn, slideReplaceOut} from '../lib/utils'
    import { quadIn, quadOut, quadInOut } from 'svelte/easing';
    import { derived, writable } from "svelte/store";
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import { activeCells, activeWord, activeSlotId, activePossibleWords } from "../StateMediator.svelte";
    import { validWordFinder } from '../lib/ClueEngine';
    import LetterBoxes from "../lib-sv/LetterBoxes.svelte";
    import {Center, Button, ActionIcon} from "@svelteuidev/core";
    import Icon, { loadIcon } from "@iconify/svelte";
//

////// Calculate number of rows to display words in. 
const maxColumns = (box, item) => {
    let ideal = box/item; 
    for (let n of [6,4,3,2]) {if (ideal > n) return n;}
    return 1;
}
let wrapperWidth: number; //bound to wrapper, below. 
let wordWidth = $activeCells?.length * 15 + 70 || 200; //12px per letter?
let colCount = maxColumns(wrapperWidth, wordWidth);
let possibleWordsHeight;


        //Search filter, sort
let rawSearchInput = "";
$: searchInput = (rawSearchInput) ? rawSearchInput.toUpperCase().replaceAll( /[^A-Z]/g , "") : "";

$: [isValidSearch, searchSubMessage, messageColour] = (!!searchInput) ? 
validWordFinder.checkValidNewWord(searchInput, $activeCells)
: [false, "", "black"];

        ///// Await, filter and chunk possible words. 
let possibleWords = []; 
activePossibleWords.subscribe((promise) => {
    promise.then( (list) => {
        rawSearchInput= "";
        possibleWords = list || [];
        wordWidth = $activeCells?.length * 15 + 70 || 200
        colCount = maxColumns(wrapperWidth, wordWidth);
    })
});

$: filteredPossibleWords = (searchInput) ? 
    possibleWords?.filter( w => w.includes(searchInput)) ?? []
    : possibleWords ?? [];

$: chunkedPossibleWords = filteredPossibleWords?.reduce((output, item, index) => { 
        const chunk = Math.floor(index/12)
        if(!output[chunk]) {output[chunk] = []}
        output[chunk].push(item)
        return output;
    }, []) 
    ?? [];

$: pluralString = filteredPossibleWords.length != 1 ? " matching words" : " matching word";


</script>

<!---->


{#if $activeSlotId!==null}
<div id="wrapper">

    <div id="topArea">
        <LetterBoxes 
        letters={$activeCells}/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!$activeWord} 
        on:click={() => $activeWord = null}> 
        <Icon icon="tabler:backspace" width="50" height="50" /> </ActionIcon>

        <input id="searchInput" bind:value={rawSearchInput}
        placeholder="Search or add a new word.."/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!isValidSearch} 
        on:click={() => $activeWord = searchInput}> 
        <Icon icon="tabler:pencil-plus" width="50" height="50" /> </ActionIcon>

        {#if filteredPossibleWords.length > 0}
            <span id="matchText"> <b>{filteredPossibleWords.length}</b>{pluralString}</span>
        {:else if searchInput}
            <span id="matchText"  style:color={messageColour}> {searchSubMessage}</span>
        {/if}
    </div>

    <div id="possibleWordsArea" bind:clientHeight={possibleWordsHeight}>
        {#key possibleWords}
            <div id="possibleWordsWrapper" 
            bind:clientWidth={wrapperWidth}
            transition:fade>
                <!-- in:fly={{y:possibleWordsHeight, duration:300, easing: quadOut}} -->
                <!-- out:slide={{ duration:300, easing: quadIn}}> -->

                {#if filteredPossibleWords && filteredPossibleWords.length > 0}  
                    <VirtualList items={chunkedPossibleWords} let:item>
                        <div class="wordRow" style="--cols:{colCount}">
                        {#each item as possibleWord}
                            <Button ripple color="dark" variant="outline" class="possword" override={{
                                fontFamily:'monospace',
                                width: "100%" 
                            }}
                            on:click={() => $activeWord = possibleWord}>{possibleWord}</Button>
                        {/each} 
                        </div>
                    </VirtualList>

                {:else if !filteredPossibleWords || filteredPossibleWords.length == 0}
                    <div id="noPossibleWords">
                        <img 
                            id="noWordsIcon" 
                            src="/src/assets/icons/nomatches.png" 
                            alt="No matching words.">

                        <p class="noWordsText"><strong>No matching words in our dictionary - sorry.</strong><br>
                        You can type new words into the bar above.</p>
                    </div>
                {/if}
            
            </div>
        {/key}
    </div>

</div>

{:else }
<Center><p> Click the grid to begin. </p></Center>
{/if}

<!---->
<style lang=scss>

    #wrapper {
        display: block;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    #topArea {
        padding: 15px;
        height: 148px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 60px;
        grid-template-rows: repeat(2, 44px) 30px;
        grid-column-gap: 15px;
        grid-row-gap: 15px;
    }

    #possibleWordsArea {
        padding: 15px;
        flex: 1 0 auto; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 148px);
        overflow: hidden;
        @include staticTransitionParent();
    }

    #possibleWordsWrapper {
        height: 100%;
        width: 100%;
        overflow: auto;
        @include staticTransitionChild();
    }

    .wordRow {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        grid-gap: 10px;
        margin: 5px 0px;
        padding-left: 5px; 
        padding-right: 20px;
    }

    /* .possword{
        background-color: red;
    } */

    #noPossibleWords {
        display: flex;
        flex-direction: column; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 148px);
        overflow: auto;
        justify-content: center;
        align-items: center;
    }

    #noWordsIcon {
        width: 50px;
        height: 50px;
    }

    .noWordsText{
        font-size: 75%;
    }

    #searchInput {
        padding: 0px 20px;
        &:after{
            margin-top: -5px;
            margin-left: -5px;
            content: '🔎︎';
            color: black;
            font-size:larger;
        }
    }

    #matchText {
        column-span: all;
        font-size: 80%; 
        margin-left: 10px;
    }

</style>