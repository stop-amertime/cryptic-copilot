<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { fly, slide } from 'svelte/transition';
import { quadInOut, quadIn, quadOut } from 'svelte/easing';
import { activeCellAnimations } from './StateMediator.svelte';
/* ========================================================================== */

export let id;
export let isValid;
export let letter = '';
export let isSelected = false;
export let isNumbered = false;
export let slots = [];

const animationDuration = 200; //ms
const animationTimingGap = 100; //ms
const dispatch = createEventDispatcher();

$: num = isNumbered ? 'numbered' : '';
$: sel = isSelected ? 'selected' : '';
$: myOrder = $activeCellAnimations.order?.[id] ?? Math.random() * 9;

$: animStyle = {
	duration: animationDuration,
	delay: myOrder * animationTimingGap, //ms
};

//todo slidereplace
$: animation =
	$activeCellAnimations.orientation == 'A'
		? {
				in: { y: 200, ...animStyle, easing: quadOut },
				out: { y: -200, ...animStyle, easing: quadIn },
		  }
		: {
				in: { x: -200, ...animStyle, easing: quadOut },
				out: { x: 200, ...animStyle, easing: quadIn },
		  };
</script>

<!----------------------------------------------------------------------HTML--->

<template lang="pug">

+if("isValid")

    .cell(id="{id+''}" class!="valid {sel} {num}" on:click!="{() => dispatch('clicked', slots)}")
        svg.letter(width="100%", height!="100%", viewBox!="-25 -75 100 100", preserveAspectRatio="none")
            +key("letter")
                text(in:fly="{animation.in}", out:fly="{animation.out}", x="0", y="0") {letter}
    
    +else()
    .cell.invalid(id="{id+''}")

</template>

<!----------------------------------------------------------------------CSS----->
<style global>
.valid,
.invalid {
	aspect-ratio: 1;
	overflow: hidden;
}

svg {
	display: block;
	width: 100%;
	height: 100%;
	position: fixed 0 0 0 0;
}

svg text {
	width: 100%;
	height: 100%;
	font-size: 500%;
	font-weight: 800;
	font-family: 'Courier New', Courier, monospace;
}

.letter {
	text-justify: center;
}

.valid {
	background-color: white;
	border: 1px solid black;
	position: relative;
	padding: 3px;
	cursor: pointer;
	user-select: none;
}

.invalid {
	display: inline;
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
	width: 0px;
	float: left;
	height: 0px;
	text-align: left;
}
</style>
