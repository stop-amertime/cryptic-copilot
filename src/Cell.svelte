<script lang="ts">
import { slideReplaceIn, slideReplaceOut, slideReplace } from './lib/utils';
import type { ISlideParams } from './lib/utils';
import { createEventDispatcher } from 'svelte';
import { fly, slide } from 'svelte/transition';
import { quadInOut, quadIn, quadOut } from 'svelte/easing';
import { activeCellAnimations } from './StateMediator.svelte';
/* ========================================================================== */

export let id: number;
export let isValid: boolean;
export let letter = '';
export let isSelected = false;
export let isNumbered = false;
export let isImpossible = false;
export let slots = [];

const animationDuration = 200; //ms
const animationTimingGap = 100; //ms
const dispatch = createEventDispatcher();

let cellWidth;
$: fontSize = (() => {
	return cellWidth + 'px';
})();
$: myOrder = $activeCellAnimations.order?.[id] ?? Math.random() * 9;
$: animDirection = $activeCellAnimations.orientation == 'A' ? 'up' : 'left';
$: animProps = {
	duration: animationDuration,
	delay: myOrder * animationTimingGap, //ms
	direction: animDirection,
};
</script>

<!----------------------------------------------------------------------HTML--->

<template lang="pug">

+if("isValid")

    .cell.valid(
    id="{id+''}" 
    class:selected="{isSelected}"
    class:numbered="{isNumbered}"
    class:impossible="{isImpossible}"
    on:click!="{() => dispatch('clicked', slots)}"
    bind:clientWidth="{cellWidth}"
    )
        +key("letter")
            .letterWrapper(
            style:--size!="{fontSize}"
            in:slideReplace="{{...animProps, easing:quadInOut}}",
            out:slideReplace="{{...animProps,out:true, easing:quadInOut}}"
            )   {letter} 
    
    +else()
    .cell.invalid(id="{id+''}")

</template>

<!----------------------------------------------------------------------CSS----->
<style global lang="scss">
.cell {
	aspect-ratio: 1;
	overflow: hidden;
	@include staticTransitionParent();
}

.letterWrapper {
	@include staticTransitionChild();
	width: 100%;
	height: 100%;
	font-family: 'Courier Prime', Courier, monospace;
	text-align: center;
	font-weight: bold;
	font-size: calc(var(--size) * 0.8);
	line-height: var(--size);
}

.valid {
	background-color: white;
	border: 0.5px solid black;
	position: relative;
	padding: 3px;
	cursor: pointer;
	user-select: none;
}

.invalid {
	display: inline;
	background-color: black;
	outline: 1px solid black;
}

.selected {
	opacity: 0.5;
	background-color: hsl(120, 100%, 85%);
}

.impossible {
	border: 1px solid red;
	background-color: hsla(0, 100%, 85%, 0.412);
}

.impossible.selected {
	border: 1px solid red;
	opacity: 0.5;
	background-color: hsl(120, 100%, 85%);
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
	text-align: left;
	position: absolute;
	top: 3px;
	left: 3px;
}
</style>
