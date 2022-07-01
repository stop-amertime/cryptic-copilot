<script lang="ts">

export let device: IDevice = {words: [{word:"ABC"},{word:"DEF"}]};

</script>
<div class = "anagram"> 
    {#each device.words as word}
        <button class ="anagramword">{word.word}</button>
    {/each}
</div> 

<style>
.anagram{
    display: block;
}

.anagramword{
    display: inline-block;
    border-radius: 2px;
    margin: 3px 5px 3px 5px; 
    padding: 3px 4px 3px 5px;
    border: 1px solid gray; 
    cursor: pointer;
}

.anagramword:hover{
    background-color:aliceblue;
}

</style>