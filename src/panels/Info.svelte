<script lang="ts">
import Meanings from './../lib-sv/Meanings.svelte';
import {
	activeWord,
	activeDeviceList,
	activeThesaurus,
} from '../StateMediator.svelte';
import DeviceList from '../lib-sv/DeviceList.svelte';
import Anagram from '../lib-sv/Anagram.svelte';
import Container from '../lib-sv/Container.svelte';
import { Wave } from 'svelte-loading-spinners';
import { fade } from 'svelte/transition';
import { writable } from 'svelte/store';
import { getThesaurus } from '../lib/DictionaryEngine';
/* -------------------------------------------------------------------------- */

let thesaurus, devices;
activeDeviceList.subscribe(promise => promise.then(val => (devices = val)));
activeThesaurus.subscribe(promise => promise.then(val => (thesaurus = val)));

let dropdownIsOpen = [true, false, false];
let pageHeight: number;
const numberOfDropdowns = 3;
const listHeaderHeight = 30; //px
$: listHeights = {
	head: listHeaderHeight,
	inner: pageHeight - listHeaderHeight * numberOfDropdowns,
};

$: listProps = [
	{ ...listHeights, index: 0, name: 'Meanings', subComponent: Meanings },
	{ ...listHeights, index: 1, name: 'Anagrams', subComponent: Anagram },
	{ ...listHeights, index: 2, name: 'Containers', subComponent: Container },
];

const closeOthers = (event: CustomEvent) => {
	event.preventDefault();

	for (let i = 0; i < dropdownIsOpen.length; i++) {
		if (i != event.detail) dropdownIsOpen[i] = false; //index.
	}
};

/* -------------------------------------------------------------------------- */
</script>

<template lang="pug">
+key('$activeWord')
    +await('Promise.all([$activeDeviceList, $activeThesaurus])')
        .centre(transition:fade!="{{ duration: 100, }}")
            Wave(size="60" color="#111111" unit="px" duration="1s")

        +then('_')
        div#page(bind:clientHeight!='{pageHeight}')
            .deviceLists(transition:fade='{{duration:100}}')

                DeviceList(
                    definition!="{thesaurus || []}"
                    on:opened="{closeOthers}"
                    "{listHeights}"
                    listProps="{listProps[0]}"
                    bind:isOpen!="{dropdownIsOpen[0]}"                        
                )

                DeviceList(
                    list!="{devices?.anagrams || []}"
                    "{listHeights}"
                    listProps="{listProps[1]}"
                    on:opened="{closeOthers}"
                    bind:isOpen!="{dropdownIsOpen[1]}"
                )

                DeviceList(
                    list!="{devices?.containers || []}"
                    on:opened="{closeOthers}"
                    "{listHeights}"
                    listProps="{listProps[2]}"
                    bind:isOpen!='{dropdownIsOpen[2]}'
                ).
</template>

<style lang="scss">
/* -------------------------------------------------------------------------- */
#page {
	@include staticTransitionParent();
	max-height: 100%;
	max-width: 100%;
	overflow: hidden;
	margin: 10px 0px;
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
	max-width: 100%;
	max-height: 100%;
	overflow: hidden;
}
</style>
