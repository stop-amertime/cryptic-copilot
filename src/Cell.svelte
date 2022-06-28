<script>
import { createEventDispatcher} from "svelte";
import { fly, slide } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export let id;
export let isValid;
export let letter = '';
export let isSelected = false;
export let isNumbered = false;
export let slots = [];
$: num = isNumbered ? "numbered" : "";
$: sel = isSelected ? "selected" : "";
const dispatch = createEventDispatcher();

</script>

{#if isValid}
        <div id={id.toString()} 
        class= "valid {sel} {num}"
        on:click={() => dispatch('clicked', slots)}>

            {#key letter} 
                {#if letter.toUpperCase() != letter.toLowerCase()}
                <svg 
                class="letter"
                in:slide={{ duration:500, easing:cubicOut}}
                out:slide={{duration:200, easing:cubicOut}} 
                width="100%"
                height="100%"
                viewBox="-25 -75 100 100"
                preserveAspectRatio="none">

                    <text x="0" y="0">
                        {letter}
                    </text>

                </svg> 
                {/if}    
            {/key} 

        </div>
{:else}

    <div id={id.toString()} class= "invalid"></div>

{/if}

<style>

    * {
        aspect-ratio: 1;
        overflow: hidden;
    }

    svg {
        display: block;
        width: 100%;
        height: 100%;
        position: fixed 0 0 0 0;
    }

    svg text{
        width: 100%;
        height: 100%;
        font-size: 500%;
        font-family: 'Courier New', Courier, monospace;
    }

    .letter {
        /* position: absolute 0 0 0 0; */
        /* font-size: calc(150%); */
        /* width: 100%; */
        /* height: 100%; */
        /* text-align: center; */
        text-justify: center; 
    }

    .valid {
        background-color: white;
        border: 1px solid black;
        position:relative;
        padding: 3px;
        cursor: pointer;
        user-select: none;
    }

    .invalid {
        display:inline;
        background-color: black;
        border: 1px solid black;
    }

    .selected {
        opacity: 0.5;
        background-color: hsl(120, 30%, 70%);
    }

    .valid:hover:not(.selected) {
        background-color: hsla(120, 29%, 70%, 0.144);
    }

    .numbered {
        counter-increment: value;
    }

    .numbered:nth-of-type(n)::before {
        content: counter(value);
        font-size: calc(5px + 0.3vw);
        line-height: 4px;
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        font-weight: bolder;
        width:0px;
        float: left;
        height: 0px;
        text-align: left;
    }

</style>