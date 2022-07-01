<script lang="ts">
import { WordInfo } from "../../modules/ClueEngine";
export let device : IDevice =
    {words: [
        {word:"ABC", score:50, direction:"word"},
        {word:"DEF", score:50, direction:"word reverse"},
        {word:"AA", score:50, direction:"word anagram", contains:[
            {word:"ABC", score:50, direction:"word"},
            {word:"DEF", score:50, direction:"word reverse"}]
        }
    ]};

function wordProps(node: HTMLButtonElement, {word, dir, pos} ) {
    let entry = WordInfo.get(word);
    node.style.background = entry.colour;
    if (entry.isAbbreviation) {node.style.fontSize = "300%"} 
    node.classList.add(dir, pos,"word");
}

</script>
<div class="container"> 
    {#each device.words as i}
        <button use:wordProps={{"word": i.word, "dir": i.direction, "pos": "outer"}}>
        {i.word} 

            {#if i.contains}{#each i.contains as j}
                    
                    <button use:wordProps={{"word": j.word, "dir": j.direction, "pos": "inner"}}>
                        {j.word}
                    </button>
            {/each}{/if}
        </button>
    {/each}
</div> 

<style lang="sass">

.container
    display: block
    height: 65px

.word 
    display:inline-block
    position: relative
    font-size: 14px
    font-family: 'Courier New', Courier, monospace
    margin: 0px 5px 0px 5px         
    border-radius:3px
    border: 1px solid black
    background-color: whitesmoke
    cursor:pointer 
    height: 50px
    line-height: 50px
    .inner
        height: 40px
        line-height: 40px

    hover
    background-color:aliceblue


.anagram:before
        content:"⟳"
        color: black
        position: absolute
        top: 0px
        left: 0px
        border-radius:3px
        width:20px
        float: left
        line-height: 20px
        text-align: center

.reverse:before 
        content:"\21A9  "
        color: black
        font-weight: bold
        position: absolute
        top: -2px
        left: -2px
        width:20px
        float: left
        line-height: 20px
        text-align: center 

</style>