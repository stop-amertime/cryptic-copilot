<script lang="ts">

import {fly} from 'svelte/transition'

export let letters = [];

</script>

<div id="letterBox">
    {#each letters as l}
        <div 
        style="--number: {letters.length}" 
        class="letter {l.isOverwritable ? '' : "fixed"}"
        in:fly={{duration:100}}>
            <svg 
            width="100%"
            height="100%"
            viewBox="0 -50 50 50"
            preserveAspectRatio="none">
                <text x="0" y="0">
                    {l.letter}
                </text>
        </div>
    {/each}
</div>

<style>

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
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.205); 
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


</style>