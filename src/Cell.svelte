<script lang="ts">
  import { slideReplaceIn, slideReplaceOut, slideReplace } from "./lib/utils";
  import type { ISlideParams } from "./lib/utils";
  import { createEventDispatcher, getContext } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { quadInOut, quadIn, quadOut } from "svelte/easing";
  import { activeCellAnimations } from "./StateMediator.svelte";
  /* ========================================================================== */

  export let id: number;
  export let isValid: boolean;
  export let letter = "";
  export let isSelected = false;
  export let isNumbered = false;
  export let isImpossible = false;
  export let slots = [];

  const animationDuration = 200; //ms
  const animationTimingGap = 100; //ms
  const dispatch = createEventDispatcher();
  let previewMode = getContext("previewMode") || false;

  let cellWidth;
  $: fontSize = (() => {
    return cellWidth + "px";
  })();
  $: myOrder = $activeCellAnimations.order?.[id] ?? Math.random() * 9;
  $: animDirection = $activeCellAnimations.orientation == "A" ? "up" : "left";
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
	class:previewMode="{previewMode}"
    class:selected="{isSelected}"
	class:selectedDown="{animDirection=='up'}"
	class:selectedAcross="{animDirection == 'left'}"
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
  @import url("https://fonts.googleapis.com/css2?family=Jetbrains+Mono:wght@300;400&display=swap");

  .cell {
    overflow: hidden;
    aspect-ratio: 1;
    @include staticTransitionParent();
    background-color: black;
    margin-right: -1px;
    margin-bottom: -1px;
  }

  .previewMode {
    color: white;

    &.selected {
      background-color: white;
    }
  }

  .letterWrapper {
    @include staticTransitionChild();
    font-family: "Jetbrains Mono", monospace;
    text-align: center;
    font-size: calc(var(--size) * 0.6);
    line-height: var(--size);
  }

  .valid {
    background-color: white;
    border: 1px solid black;
    position: relative;
    padding: 3px;
    cursor: pointer;
    user-select: none;

    &.selected {
      font-weight: bold;
      background-color: rgb(255, 255, 222);
    }
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

  .valid:hover {
    background-color: $col-highlight;
  }

  .numbered {
    counter-increment: value;
  }

  .numbered:nth-of-type(n)::before {
    content: counter(value);
    font-size: calc(6px + 0.3vw);
    line-height: 6px;
    font-weight: bolder;
    text-align: left;
    position: absolute;
    top: 3px;
    left: 3px;
    color: black;
  }
</style>
