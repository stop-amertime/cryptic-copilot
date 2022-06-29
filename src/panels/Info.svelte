<script>

import { selectedSlotWord } from "../stores";
import { DeviceFinder }  from '../modules/ClueEngine';
import VirtualList from '@sveltejs/svelte-virtual-list'

let isActive = true;
let deviceLists = null; 

selectedSlotWord.subscribe( (slotWord) => {
    if (slotWord.word)
    {
        deviceLists = DeviceFinder.devicesFor(slotWord.word);
        //dictionaryList = DeviceFinder.definitions()
    }
});

</script>


{#await deviceLists}
<div> Loading Devices.. </div>

{:then lists}
    {#each lists as list}
        <div> I am a list {list}</div>
    {/each}
{/await}



