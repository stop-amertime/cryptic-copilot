<script lang="ts">
import VirtualList from '@sveltejs/svelte-virtual-list';
import Meanings from './infopanels/Meanings.svelte';
import { activeWord, activeDeviceList, activeThesaurus } from '../StateMediator.svelte';
import Anagram from './infopanels/Anagram.svelte';
import Container from './infopanels/Container.svelte';
import { Wave } from 'svelte-loading-spinners';
import { fade } from 'svelte/transition';
import { writable } from 'svelte/store';
import { getThesaurus } from '../lib/DictionaryEngine';
import { dataset_dev } from 'svelte/internal';
import HiddenWord from './infopanels/HiddenWord.svelte';
/* -------------------------------------------------------------------------- */

let thesaurus: IThesaurusEntry = { partsOfSpeech: [], numberOfSenses: 0 };
let devices: IDeviceSet = { anagrams: [], containers: [], hiddenwords: [] };
let tabHeight, pageHeight;

let tabs = writable([
	{ label: 'Meanings', number: thesaurus.numberOfSenses },
	{ label: 'Anagrams', number: devices.anagrams.length },
	{ label: 'Charades', number: devices.containers.length },
	{ label: 'Hidden In', number: 55 },
	{ label: 'Sounds Like', number: devices.containers.length },
]);

activeDeviceList.subscribe(promise => promise.then(d => (devices = d)));
activeThesaurus.subscribe(promise => promise.then(t => (thesaurus = t)));

$: $tabs[0].number = thesaurus.numberOfSenses;
$: $tabs[1].number = devices.anagrams.length;
$: $tabs[2].number = devices.containers.length;

let currentTab = 0;
let previousTab = $tabs.length - 1;
let displayTab = 0;
let pageChangeDirection: 'up' | 'down' | 'left' | 'right' = 'right';
$: changePage(currentTab);

function changePage(tabNumber: number) {
	pageChangeDirection = tabNumber < previousTab ? 'left' : 'right';
	previousTab = tabNumber;
	displayTab = tabNumber;
}

/* -------------------------------------------------------------------------- */
</script>

{#key '$activeWord'}
	{#await Promise.all([$activeDeviceList, $activeThesaurus])}
		<div class="centre" transition:fade={{ duration: 100 }}>
			<Wave size="60" color="#111111" unit="px" duration="1s" />
		</div>
	{:then}
		<div class="page" bind:clientHeight={pageHeight}>
			<div class="tabs" bind:clientHeight={tabHeight}>
				{#each $tabs as tab, index}
					<button
						on:click={() => (currentTab = index)}
						class:selectedTab={currentTab == index}
						class:disabled={!tab.number}
						disabled={!tab.number}
					>
						{tab.label}
						<small>{tab.number}</small>
					</button>
				{/each}
			</div>
			<hr />
			{#key displayTab}
				<div class="deviceList" transition:fade={{ duration: 100 }}>
					<div class="listWrapper">
						{#if displayTab == 0}
							<Meanings data={thesaurus} />
						{:else if displayTab == 1}
							<VirtualList items={devices.anagrams} let:item>
								<svelte:component this={Anagram} data={item} />
							</VirtualList>
						{:else if displayTab == 2}
							<VirtualList items={devices.containers} let:item>
								<svelte:component this={Container} data={item} />
							</VirtualList>
						{:else if displayTab == 3}
							<HiddenWord hiddenwords={devices.hiddenwords} />
						{/if}
					</div>
				</div>
			{/key}
		</div>
	{/await}
{/key}

<style lang="scss">
/* -------------------------------------------------------------------------- */
.page {
	height: 100%;
	width: 100%;
	margin: 0px;
	display: block;
	overflow: hidden;
}

.centre {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tabs {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	padding: 15px;
	button {
		flex: 1 0 auto;
		position: relative;
		padding: 10px;
		margin: 3px 5px;
		border: none;
		outline: 1px solid grey;
		border-radius: 50px;
		background-color: white;
		&:hover {
			background-color: rgb(217, 217, 217);
		}
		&.selectedTab {
			border: 1px solid black;
		}
		&.disabled {
			background-color: rgb(205, 205, 205);
			color: gray;
			pointer-events: none;
			outline: none;
		}
	}
}

.deviceList {
	height: calc(100% - 70px);
	width: 100%;
	padding-left: 20px;
	.listWrapper {
		height: 100%;
		width: 100%;
		overflow: auto;
	}
}
</style>
