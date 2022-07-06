<script lang="ts">
import Meanings from './../lib-sv/Meanings.svelte';
import { activeWord, activeDeviceList } from '../StateMediator.svelte';
import DeviceList from '../lib-sv/DeviceList.svelte';
import Anagram from '../lib-sv/Anagram.svelte';
import Container from '../lib-sv/Container.svelte';
import { Wave } from 'svelte-loading-spinners';
import { fade } from 'svelte/transition';
/* -------------------------------------------------------------------------- */

let pageHeight: number;
let dropdownIsOpen = [true, false, false];
let deviceSet; 

function closeOthers(event: CustomEvent) {
    console.log("ID: `{event.target} -- Closing Others");
	event.preventDefault();
	let elementId = event.detail;
	for (let i = 0; i < dropdownIsOpen.length; i++) {
		if (i != elementId) dropdownIsOpen[i] = false;
	}
}


/* -------------------------------------------------------------------------- */
</script>

<template lang="pug">
+key('$activeWord')
    +await('$activeDeviceList')
        .centre(transition:fade!="{{ duration: 100, }}")
            Wave(size="60" color="#111111" unit="px" duration="1s")

        +then('deviceSet')
            div#page(bind:clientHeight='{pageHeight}')
                .deviceLists(transition:fade='{{duration:100}}')

                    DeviceList(
                        name="Meanings" index="{0}"
                        list!="{deviceSet?.thesaurus || []}"
                        subComponent="{Meanings}" 
                        maxHeight="{pageHeight}"
                        on:opened="{closeOthers}"
                        bind:isOpen="{dropdownIsOpen[0]}"
                        useVirtualList="{false}"
                    )

                    DeviceList(
                        name="Anagrams" index="{1}"
                        list!="{deviceSet?.anagrams || []}"
                        subComponent="{Anagram}" 
                        maxHeight="{pageHeight}"
                        on:opened="{closeOthers}"
                        bind:isOpen="{dropdownIsOpen[1]}"
                    )

                    DeviceList(
                        name="Containers" index="{2}"
                        list!="{deviceSet?.containers || []}"
                        maxHeight="{pageHeight}"
                        subComponent="{Container}"
                        on:opened="{closeOthers}"
                        bind:isOpen='{dropdownIsOpen[2]}'
                    ).
</template>

<style lang="scss">
/* -------------------------------------------------------------------------- */
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

.deviceLists {
	width: 100%;
	height: 100%;
}
</style>
