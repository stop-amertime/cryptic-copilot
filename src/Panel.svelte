<script lang="ts">

import PossibleWords from './panels/PossibleWords.svelte'
import Info from './panels/Info.svelte'
import Clues from './panels/Clues.svelte'
import Settings from './panels/Settings.svelte'

import {activeWord} from './StateMediator.svelte'

import { writable } from 'svelte/store'
import { fly } from 'svelte/transition';
import { quadIn, quadOut } from 'svelte/easing';


// Display the correct page based on Tab Selection
let tabs = writable([
    {label:'Word', "checked":true, disabled:false},
    {label:'Info', "checked":false, disabled:true},
    {label:'Clues', "checked":false, disabled:false}, 
    {label:'Settings', "checked":false, disabled:false}
]);

let displayPage = {
    "Word":PossibleWords, "Info":Info, "Clues":Clues, "Settings":Settings
};

let currentTab = 'Word';
$: currentPage = displayPage[currentTab];


// Toggle disabling Tab 2 (Word Info) when word is null.
$: if (!$activeWord) {
    if (currentTab == 'Info') {currentTab = 'Word'};
    $tabs[1].disabled = true; 
} 
else {
    $tabs[1].disabled = false;
}
</script>




<div id="panelWrapper">

    <div id="panelTabs">
        {#each $tabs as tab}
            <label class='{tab.label == currentTab ? "selected" : ""} {tab.disabled ? "disabled" : ""}'>
                <input type="radio" 
                value={tab.label}
                bind:group={currentTab} 
                disabled='{tab.disabled}'
                hidden/>
                {tab.label}
            </label>
        {/each}
    </div>

    <div id="panelPageBorder">
        {#key currentPage}
            <div id="panelPage" 
            in:fly={{x:50,duration:200,delay:200, easing: quadIn}} 
            out:fly={{x:-50, duration:200, easing: quadOut}}>
                
                <svelte:component  this={currentPage}/>
            
            </div>
        {/key}
    </div>
</div>




<style>


#panelWrapper {
    width: 100%;
    height:100%;
    display: flex; 
    flex-direction: column;
    overflow:hidden;
}

/* Static border, doesn't move while internal panel animates. */
#panelPageBorder { 
    width: 100%;
    flex: 1 0 300px;
    border-right: 1px solid grey;
    border-left: 1px solid grey;
    border-bottom: 1px solid grey;
    border-radius: 0px 0px 5px 5px;
    overflow: hidden;
}

#panelPage {
    padding: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden; 
}

/* TABS  */

    #panelTabs{

        width: 100%;
        flex: 0 0 30px;

        display: flex;
        flex-direction: row;
        flex-wrap: nowrap; 
    }

    label{
        flex: 1 0 auto;
        margin: 0;
        padding: 10px 10px;
        border-radius: 5px 5px 0 0;
        border-width: 1px 1px 1px 1px;
        border-style: solid;
        border-color: rgb(184, 184, 184);
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        -webkit-transition: all 0.2s ease-in-out;
        transition: all 0.2s ease-in-out;
        text-align: center;
    }

    .selected{
        z-index: 4;
        margin-top: 0px;
        padding-top: 5px;
        background: white;
        border-color: rgb(184, 184, 184) rgb(184, 184, 184) white rgb(184, 184, 184);
    }

    .disabled{
        background-color: grey;
        opacity: 0.4;
    }

  
/*  */





</style>
