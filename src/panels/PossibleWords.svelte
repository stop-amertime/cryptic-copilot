<script lang="ts">
//
    import { derived, writable } from "svelte/store";
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import { activeCells, activeWord, activeSlotId } from "../StateMediator.svelte";
    import { validWordFinder } from '../modules/ClueEngine';
    import LetterBoxes from "./subcomponents/LetterBoxes.svelte";
    import {Center, Button, ActionIcon} from '@svelteuidev/core'
    import Icon from "@iconify/svelte";
//

let rawSearchInput = "";
$: searchInput = (rawSearchInput) ? rawSearchInput.toUpperCase().replaceAll( /[^A-Z]/g , "") : "";

$: possibleWords = ($activeCells) ? validWordFinder.search($activeCells) : [];

$: filteredPossibleWords = (!!searchInput) ? 
    possibleWords.filter( w => w.includes(searchInput))
    : possibleWords;

$: chunkedPossibleWords = filteredPossibleWords.reduce((output, item, index) => { 
    const chunk = Math.floor(index/12)
    if(!output[chunk]) {output[chunk] = []}
    output[chunk].push(item)
    return output;
}, [])


let wrapperWidth: number; //bound to wrapper, below. 
$: wordWidth = $activeCells?.length * 15 + 70 || 200; //12px per letter?
$: colCount = maxColumns(wrapperWidth, wordWidth);
const maxColumns = (box, item) => {
    let ideal = box/item; 
    for (let n of [6,4,3,2]) {if (ideal > n) return n;}
    return 1;
}

$: [isValidSearch, searchSubMessage, messageColour] = (!!searchInput) ? 
    validWordFinder.checkValidNewWord(searchInput, $activeCells)
    : [false, "", "black"];

</script>
<!---->

{#if $activeSlotId!==null}
<div id="wrapper">

    <div id="topArea">
        <LetterBoxes letters={$activeCells}/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!$activeWord} 
        on:click={() => $activeWord = null}> 
        <Icon icon="tabler:backspace" width="50" height="50" /> </ActionIcon>

        <input id="searchInput" bind:value={rawSearchInput}
        placeholder="🔎︎  Search or add a new word.."/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!isValidSearch} 
        on:click={() => $activeWord = searchInput}> 
        <Icon icon="tabler:pencil-plus" width="50" height="50" /> </ActionIcon>

        {#if filteredPossibleWords.length > 0}
            <span id="matchText"> {filteredPossibleWords.length} matching words. </span>
        {:else if searchInput}
            <span id="noWordsText"  style:color={messageColour}> {searchSubMessage}</span>
        {/if}
    </div>

    {#if filteredPossibleWords && filteredPossibleWords.length > 0}

        <div id="possibleWordsWrapper" bind:clientWidth={wrapperWidth}>
            
            <VirtualList items={chunkedPossibleWords} let:item>
                <div class="wordRow" style="--cols:{colCount}">
                {#each item as possibleWord}
                    <Button ripple variant="outline" class="possword" override={{
                        fontFamily:'monospace',
                        width: "100%" 
                    }}
                    on:click={() => $activeWord = possibleWord}>{possibleWord}</Button>
                {/each} <!--TODO: change to event -->
                </div>
            </VirtualList>
        </div>

    {:else}
        <div id="noPossibleWords">
            <img 
                id="noWordsIcon" 
                src="/src/assets/icons/nomatches.png" 
                alt="No matching words.">

            <h3>No matching words in our dictionary - sorry.</h3>
            <p>You can type new words into the bar above.</p>
        </div>
    {/if}

</div>

{:else }
<Center><p> Click the grid to begin. </p></Center>
{/if}

<!---->
<style>

    #wrapper {
        display: block;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    #topArea {
        height: 148px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 60px;
        grid-template-rows: repeat(2, 44px) 30px;
        grid-column-gap: 15px;
        grid-row-gap: 15px;
    }

    #possibleWordsWrapper {
        flex: 1 0 auto; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 148px);
        overflow: auto;
    }

    .wordRow {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        grid-gap: 10px;
        margin: 5px 0px; 
    }

    .possword{
        background-color: red;
    }

    #noPossibleWords {
        flex: 1 0 auto; 
        display: flex;
        flex-direction: column; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 148px);
        overflow: auto;
    }

    #noWordsIcon {
        width: 50px;
        height: 50px;
    }

    #noWordsText{
        font-size: 75%;
    }

</style>