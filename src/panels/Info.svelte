<script lang="ts">
        import { activeWord, activeDeviceList } from "../StateMediator.svelte";
        import { Devices }  from '../lib/ClueEngine';
        import DeviceList from "../lib-sv/DeviceList.svelte";
        import Anagram from '../lib-sv/Anagram.svelte';
        import Container from '../lib-sv/Container.svelte';
        import {Wave} from 'svelte-loading-spinners';
        import {fade} from 'svelte/transition'


// $: deviceSetPromise = ($activeWord) ? $activeDeviceList : null

let pageHeight;
let dropdownIsOpen = [true, false];

function closeOthers(event){
        event.preventDefault();
        let elementId = event.detail;
        for (let i=0; i<dropdownIsOpen.length; i++){
                if (i!=elementId) dropdownIsOpen[i] = false;
        }

        // let items = document.getElementsByTagName('details');
        // for (let i=0; i<items.length;i++){
        //         if (i!=elementId) 
        //                 items[i].removeAttribute("open")}
}

</script>
{#key $activeWord}
<div id="page" 
bind:clientHeight={pageHeight}
>
    {#await $activeDeviceList}
    <div class='centre' transition:fade={{duration:100}}> 
        <Wave size="60" color="#111111" unit="px" duration="1s"/> 
    </div>

    {:then deviceSet}
    <div class = "deviceLists" transition:fade={{duration:100}}>       
        <DeviceList 
        name="Anagrams" index={0}
        list={deviceSet?.anagrams || []}
        subComponent={Anagram}
        maxHeight={pageHeight}
        on:opened={closeOthers}
        bind:isOpen={dropdownIsOpen[0]}
        />

        <DeviceList 
        name="Containers" index={1}
        list={deviceSet?.containers || []}
        maxHeight={pageHeight}
        subComponent={Container}
        on:opened={closeOthers}
        bind:isOpen={dropdownIsOpen[1]}
        /> 
    </div>   
    {/await}

</div>
{/key}

<style lang="scss">

#page {
    @include staticTransitionParent();
    height: 100%; 
    width: 100%;
}


.centre {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.deviceLists{
    width: 100%;
    height: 100%;
}

</style>

