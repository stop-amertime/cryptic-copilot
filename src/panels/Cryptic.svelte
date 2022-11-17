<script lang="ts">
import Substitution from './infopanels/Substitution.svelte';
import VirtualList from '@sveltejs/svelte-virtual-list';
import Meanings from './infopanels/Meanings.svelte';
import { activeDeviceList, activeSoundsLike, activeThesaurus } from '../StateMediator.svelte';
import Anagram from './infopanels/Anagram.svelte';
import Container from './infopanels/Container.svelte';
import { Wave } from 'svelte-loading-spinners';
import { fade } from 'svelte/transition';
import { writable } from 'svelte/store';
import HiddenWord from './infopanels/HiddenWord.svelte';
import SoundsLike from './infopanels/SoundsLike.svelte';
/* -------------------------------------------------------------------------- */

let thesaurus: IThesaurusEntry = { partsOfSpeech: [], numberOfSenses: 0 };
let devices: IDeviceSet = {
	anagrams: [],
	containers: [],
	hiddenwords: [],
	soundslike: [],
	substitutions: new Map(),
};
let soundslike: IWord[] = [];

let tabHeight, pageHeight;

let tabs = writable([
	{ label: 'Meanings', number: thesaurus.numberOfSenses },
	{ label: 'Anagrams', number: devices.anagrams.length },
	{ label: 'Charades', number: devices.containers.length },
	{ label: 'Hidden In', number: 55 },
	{ label: 'Sounds Like', number: soundslike.length },
	{ label: 'Substitute', number: devices.substitutions.size },
]);

activeDeviceList.subscribe(promise => promise.then(d => (devices = d)));
activeThesaurus.subscribe(promise => promise.then(t => (thesaurus = t)));
activeSoundsLike.subscribe(promise => promise.then(s => (soundslike = s)));

$: $tabs[0].number = thesaurus.numberOfSenses;
$: $tabs[1].number = devices.anagrams.length;
$: $tabs[2].number = devices.containers.length;
$: $tabs[3].number = devices.hiddenwords.length;
$: $tabs[4].number = soundslike.length;
$: $tabs[5].number = devices.substitutions.size;

let currentTab = 0;
let previousTab = $tabs.length - 1;
let displayTab = 0;
var pageChangeDirection: 'up' | 'down' | 'left' | 'right' = 'right';
$: changePage(currentTab);

const changePage = (tabNumber: number) => {
	pageChangeDirection = tabNumber < previousTab ? 'left' : 'right';
	previousTab = tabNumber;
	displayTab = tabNumber;
};

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
						class:selectedTab={displayTab == index}
						class:disabled={!tab.number}
						disabled={!tab.number}
					>
						{tab.label}
						<small>{tab.number}</small>
					</button>
				{/each}
			</div>
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
						{:else if displayTab == 4}
							<SoundsLike list={soundslike} />
						{:else if displayTab == 5}
							<Substitution list={devices.substitutions} />
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
	margin: 10px;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	button {
		padding: 20px 10px;
		margin-right: -1px;
		margin-bottom: -1px;
		border: 1px solid rgb(183, 183, 183);
		font-style: normal;
		color: rgb(110, 110, 110);
		background-color: white;
		cursor: pointer;

		&:not(.selectedTab):hover {
			background-color: rgb(245, 245, 245);
		}
		&.selectedTab {
			font-style: bolder;
			color: black;
			background-color: rgb(245, 245, 245);
			border: 1px solid black;
			z-index: 1;
		}
		&.disabled {
			color: rgba(180, 180, 180, 0.53);
			pointer-events: none;
			cursor: not-allowed;
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
