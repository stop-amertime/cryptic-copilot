<script lang="ts">
/*-----------------------------------------*/
import { activeSlotWord } from "../StateMediator.svelte";
import { Devices }  from '../modules/ClueEngine';
import VirtualList from '@sveltejs/svelte-virtual-list'
import DeviceList from "./subcomponents/DeviceList.svelte";
import Anagram from './subcomponents/Anagram.svelte';
import Container from './subcomponents/Container.svelte';
/*-----------------------------------------*/

let isActive = true;
$: deviceSetPromise = (!!$activeSlotWord) ? Devices.get($activeSlotWord) : null
</script>

<div id="page">
        {#await deviceSetPromise}
        <div> Loading Devices.. </div>

        {:then deviceSet}        
                <DeviceList 
                name="Anagrams" index={1}
                list={deviceSet?.anagrams || []}
                subComponent={Anagram}
                opened={true}
                />

                <DeviceList 
                name="Containers" index={2}
                list={deviceSet?.containers || []}
                subComponent={Container}
                opened={true}
                />    
        {/await}
</div>

<style>
#page {
        height: 100%; 
        width: 100%;
}
</style>

