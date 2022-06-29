<script>

import { selectedSlotWord } from "../stores";
import { WordInfo }  from '../modules/ClueEngine';
import VirtualList from '@sveltejs/svelte-virtual-list'

let isActive = true;
let deviceSet = null; 

selectedSlotWord.subscribe( (slotWord) => {
    if (slotWord.word)
    {
        deviceSet = WordInfo.getDevices(slotWord.word);
        //dictionaryList = DeviceFinder.definitions()
    }
});

</script>


{#await deviceSet}
<div> Loading Devices.. </div>

{:then lists}
    {#each lists as list}
        <div> I am a list {list}</div>
    {/each}
{/await}



