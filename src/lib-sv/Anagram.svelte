<script lang="ts">
import { WordInfo } from "../../lib/ClueEngine";
import Popover from 'svelte-popover';

export let device : IDevice =
    {words: [
        {word:"ABC", score:50, direction:"word"},
        {word:"DEF", score:50, direction:"word reverse"},
        {word:"AA", score:50, direction:"word anagram", contains:[
            {word:"ABC", score:50, direction:"word"},
            {word:"DEF", score:50, direction:"word reverse"}]
        }
    ]};

function wordScore(node: HTMLButtonElement, {word} ) {
    let entry = WordInfo.get(word);
    node.style.background = entry.colour;
    if (entry.isAbbreviation) {node.classList.add("abbr")} 
    node.classList.add("word");
}


</script>
<div class="device"> 
    {#each device.words as i,index}
        <button use:wordScore={{"word": i.word}} class="word">
        {i.word}
        </button>
        {#if index<device.words.length-1} & {/if}
    {/each}
</div> 



<style lang="scss">

.device{
    display: flex;
    align-items: stretch;
    height: 40px;
    line-height: 40px;
}

:global(.word) {
    display:inline-block;
    position: relative;
    font-size: 16px;
    font-family: 'Courier New', Courier, monospace;
    margin: 2px 2px;
    border-radius:2px;
    border:1px solid gray;
    cursor:pointer ;
    &:hover{
        opacity: 0.8;
    }
    overflow:visible;
}

:global(.word.abbr){
    font-style: italic;
}



</style>