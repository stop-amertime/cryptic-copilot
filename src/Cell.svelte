<script>
import { createEventDispatcher} from "svelte";
import { fly, slide } from 'svelte/transition';
import { cubicIn, cubicOut } from 'svelte/easing';
import {activeCellAnimations} from './StateMediator.svelte'

export let id;
export let isValid;
export let letter = '';
export let isSelected = false;
export let isNumbered = false;
export let slots = [];
$: num = isNumbered ? "numbered" : "";
$: sel = isSelected ? "selected" : "";

const dispatch = createEventDispatcher();
$: myOrder = $activeCellAnimations.order?.[id] ?? Math.random() * 7;

$: animStyle = {
    duration:500, 
    delay:(myOrder  * 150) //ms
};

$: animation = $activeCellAnimations.orientation == "A" 
    ? {in: {y:300, ...animStyle, easing:cubicOut}, out:{y:-300, ...animStyle, easing: cubicIn}}
    : {in: {x:-300, ...animStyle,easing:cubicOut}, out:{x:300 , ...animStyle, easing: cubicIn}};

</script>

{#if isValid}
        <div id={id.toString()} 
        class= "valid {sel} {num}"
        on:click={() => dispatch('clicked', slots)}>


                <svg 
                class="letter"                
                width="100%"
                height="100%"
                viewBox="-25 -75 100 100"
                preserveAspectRatio="none">

                    {#key letter} 

                    <text
                        in:fly={animation.in}
                        out:fly={animation.out}
                        x="0" y="0">
                        {letter}
                    </text>

                    {/key} 
                </svg> 

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
        font-weight: 800;
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