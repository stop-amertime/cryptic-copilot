<script lang="ts">
        import { activeWord } from "../StateMediator.svelte";
        import { Devices }  from '../lib/ClueEngine';
        import DeviceList from "./subcomponents/DeviceList.svelte";
        import Anagram from '../lib-sv/Anagram.svelte';
        import Container from './subcomponents/Container.svelte';


$: deviceSetPromise = (!!$activeWord) ? Devices.get($activeWord) : null

let pageHeight;

function closeOthers(event){
        event.preventDefault();
        let elementId = event.detail;
        let items = document.getElementsByTagName('details');
        for (let i=0; i<items.length;i++){
                if (i!=elementId) 
                        items[i].removeAttribute("open")}
}

</script>

<div id="page" 
bind:clientHeight={pageHeight}
>
        {#await deviceSetPromise}
        <div> Loading Devices.. </div>

        {:then deviceSet}        
                <DeviceList 
                name="Anagrams" index={0}
                list={deviceSet?.anagrams || []}
                subComponent={Anagram}
                maxHeight={pageHeight}
                on:opened={closeOthers}
                />

                <DeviceList 
                name="Containers" index={1}
                list={deviceSet?.containers || []}
                maxHeight={pageHeight}
                subComponent={Container}
                on:opened={closeOthers}
                />    
        {/await}
</div>

<style>
#page {
        height: 100%; 
        width: 100%;
}
</style>

