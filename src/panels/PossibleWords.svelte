<script lang="ts">

/*-------------------------------------*/
import { derived, writable } from "svelte/store";
import VirtualList from "@sveltejs/svelte-virtual-list";
import { activeSlotCells, activeSlotWord, activeSlotId } from "../StateMediator.svelte";
import { validWordFinder } from '../modules/ClueEngine';
import { fly } from 'svelte/transition'
import IconButton from "./subcomponents/IconButton.svelte";
import LetterBoxes from "./subcomponents/LetterBoxes.svelte";
import {Center, Button, ActionIcon} from '@svelteuidev/core'
import Icon from "@iconify/svelte";

/*-------------------------------------*/

let rawSearchInput = "";
$: searchInput = (rawSearchInput) ? rawSearchInput.toUpperCase().replaceAll( /[^A-Z]/g , "") : "";

$: possibleWords = ($activeSlotCells) ? validWordFinder.search($activeSlotCells) : [];

$: filteredPossibleWords = (!!searchInput) ? 
    possibleWords.filter( w => w.includes(searchInput))
    : possibleWords;

$: [isValidSearch, searchSubMessage, messageColour] = (!!searchInput) ? 
    validWordFinder.checkValidNewWord(searchInput, $activeSlotCells)
    : [false, "", "black"];

</script>

{#if $activeSlotId}
<div id="wrapper">

    <div id="topArea">

        <LetterBoxes letters={$activeSlotCells}/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!$activeSlotWord} on:click={() => $activeSlotWord = null}>
        <Icon icon="tabler:backspace" width="50" height="50" /> </ActionIcon>

        <input id="searchInput" bind:value={rawSearchInput}
        placeholder="🔎︎  Search or add a new word.."/>

        <ActionIcon color="dark" size="xl" variant="outline"
        disabled={!isValidSearch} on:click={() => $activeSlotWord = searchInput}>
        <Icon icon="tabler:pencil-plus" width="50" height="50" /> </ActionIcon>

        {#if filteredPossibleWords.length > 0}
            <span id="matchText"> {filteredPossibleWords.length} matching words. </span>
        {:else if searchInput}
            <span id="noWordsText"  style:color={messageColour}> {searchSubMessage}</span>
        {/if}
    </div>

    {#if filteredPossibleWords && filteredPossibleWords.length > 0}

        <div id="possibleWordsWrapper">
            
            <VirtualList items={filteredPossibleWords} let:item>

                <Button ripple variant="outline" class="possibleWord" 
                    on:click={() => $activeSlotWord = item}>
                    {item}
                </Button>

            </VirtualList>
        </div>

    {:else}
        <div id="noPossibleWords">
        <Center>
            <img 
                id="noWordsIcon" 
                src="/src/assets/icons/nomatches.png" 
                alt="No matching words.">
        </Center>
        </div>
    {/if}

</div>

{:else }
<Center><p> Click the grid to begin. </p></Center>
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
        grid-template-rows: repeat(2, 44px) 40px;
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

    #noPossibleWords {
        flex: 1 0 auto; 
        min-height: 200px;
        width: 100%;
        height: calc(100% - 200px);
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
