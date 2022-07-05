<script lang=ts>
import {wordSlots, activeSlotId} from '../StateMediator.svelte'

console.log($wordSlots);

$: if ($activeSlotId!==null){
    document.querySelector('.selectedClue')?.classList.remove('selectedClue');
    document.getElementById($wordSlots[$activeSlotId]?.clueIndex)?.classList.add('selectedClue');
}

const sizeMe = (node, id) => {let elem = document.getElementById(id); elem.style.height = "auto"; elem.style.height = elem.scrollHeight+"px";}
const selectMe = (event) => {$activeSlotId = $wordSlots.findIndex(s => s.clueIndex == event.target.id)};
const resizeMe = (event) => sizeMe(null,event.target.id);
</script>

<div id="page"> 
    <div class="column"> 
        <h3> Across </h3>
            {#each $wordSlots.filter(s => s.orientation == "A") as slot}
            <div class="clue">

                <p class="label">{slot.number}.</p>

                <textarea id={slot.clueIndex}
                contenteditable 
                use:sizeMe={slot.clueIndex}
                bind:value={slot.clue}
                on:focus={selectMe}
                on:input={resizeMe}></textarea>
            </div>
            {/each}
    </div>


    <div class="column"> 
        <h3> Down </h3>
            {#each $wordSlots.filter(s => s.orientation == "D") as slot}
            <div class="clue">

                <p class="label">{slot.number}.</p>
                
                <textarea 
                id={slot.clueIndex}
                contenteditable
                use:sizeMe={slot.clueIndex}
                bind:value={slot.clue}
                on:focus={selectMe}
                on:input={resizeMe}></textarea>

            </div>
            {/each}
    </div>

</div>


<style lang="scss">
    #page {
        padding: 20px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
        overflow-y:auto;
    }

    .column {  
        flex: 1 0 300px;
        display: block;
        padding: 10; 
    }

    .column h3{
        font-size: 16px;
    }

    .clue {
        display: flex;
        flex-direction: row;
    }

    .label {
        flex: 0 0 30px;
    }

    textarea {
        border: none;
        flex: 1 0 auto;
        margin: 10px;
        resize: none; 
        font-weight: normal;
        padding: 1px;
        transition: all 0.2s fade; 
    }

    :global(.selectedClue) {
        background-color: rgb(220, 255, 220);
    }
    
</style>