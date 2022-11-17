<script lang="ts">
import { fade, fly, slide, SlideParams } from 'svelte/transition';
import { slideReplaceIn, slideReplaceOut } from '../lib/utils';
import { quadIn, quadOut, quadInOut } from 'svelte/easing';
import { derived, writable } from 'svelte/store';
import VirtualList from '@sveltejs/svelte-virtual-list';
import {
	activeCells,
	activeWord,
	activeSlotId,
	activePossibleWords,
	isWordBanned,
} from '../StateMediator.svelte';
import { PossibleWords, scoreToColour, isPriorityWord } from '../lib/DictionaryEngine';
import LetterBoxes from '../lib-sv/LetterBoxes.svelte';
import { Center, Button, ActionIcon } from '@svelteuidev/core';
import Icon, { loadIcon } from '@iconify/svelte';
/* -------------------------------------------------------------------------- */

/* ..................................... Find #cols To Show Possible Words In */

const maxColumns = (box, item) => {
	let ideal = box / item;
	for (let n of [6, 4, 3, 2]) {
		if (ideal > n) return n;
	}
	return 1;
};
let wrapperWidth: number; //bound to wrapper, below.
let wordWidth = $activeCells?.length * 15 + 70 || 200; //12px per letter?
let colCount = maxColumns(wrapperWidth, wordWidth);
let possibleWordsHeight;

/* ..................................................... Search, Filter, Sort */

let rawSearchInput = '';
$: searchInput = rawSearchInput ? rawSearchInput.toUpperCase().replaceAll(/[^A-Z]/g, '') : '';

$: [isValidSearch, searchSubMessage, messageColour] = !!searchInput
	? PossibleWords.validate(searchInput, $activeCells)
	: [false, '', 'black'];

/* .................................. Await, Filter And Chunk Possible Words. */

activePossibleWords.subscribe(list => {
	rawSearchInput = '';
	wordWidth = $activeCells?.length * 15 + 70 || 200;
	colCount = maxColumns(wrapperWidth, wordWidth);
});

$: filteredPossibleWords = !!searchInput
	? $activePossibleWords?.filter(w => w.word.includes(searchInput)) ?? []
	: $activePossibleWords ?? [];

$: chunkedPossibleWords =
	filteredPossibleWords?.reduce((output, item, index) => {
		const chunk = Math.floor(index / 12);
		if (!output[chunk]) {
			output[chunk] = [];
		}
		output[chunk].push(item);
		return output;
	}, []) ?? [];

$: pluralString = filteredPossibleWords.length != 1 ? ' matching words' : ' matching word';

function checkIfBanned(node: HTMLElement, word: string) {
	if ($isWordBanned(word)) {
		node.classList.add('banned');
	}
}

/* ==================================== - =================================== */
</script>

<!---->

{#if $activeSlotId !== null}
	<div id="wrapper">
		<div id="topArea">
			<LetterBoxes letters={$activeCells} />

			<ActionIcon
				color="dark"
				size="xl"
				variant="outline"
				disabled={!$activeWord}
				on:click={() => ($activeWord = null)}
			>
				<Icon icon="tabler:backspace" width="50" height="50" />
			</ActionIcon>

			<input
				id="searchInput"
				bind:value={rawSearchInput}
				placeholder="Search or add a new word.."
			/>

			<ActionIcon
				color="dark"
				size="xl"
				variant="outline"
				disabled={!isValidSearch}
				on:click={() => ($activeWord = searchInput)}
			>
				<Icon icon="tabler:pencil-plus" width="50" height="50" />
			</ActionIcon>

			{#if filteredPossibleWords.length > 0}
				<span id="matchText">
					<b>{filteredPossibleWords.length}</b>
					{pluralString}
				</span>
			{:else if searchInput}
				<span id="matchText" style:color={messageColour}>
					{searchSubMessage}
				</span>
			{/if}
		</div>
		<div id="possibleWordsArea" bind:clientHeight={possibleWordsHeight}>
			{#key $activeSlotId}
				<div id="possibleWordsWrapper" bind:clientWidth={wrapperWidth} transition:fade>
					{#if filteredPossibleWords && filteredPossibleWords.length > 0}
						<VirtualList items={chunkedPossibleWords} let:item>
							<div class="wordRow" style="--cols:{colCount}">
								{#each item as possibleWord}
									<button
										class="possword"
										class:priorityWord={isPriorityWord(possibleWord.word)}
										use:checkIfBanned={possibleWord.word}
										style:--score={possibleWord.score}
										style:--col={scoreToColour(possibleWord.score)}
										on:click={() => ($activeWord = possibleWord.word)}
									>
										{possibleWord.word}
									</button>
								{/each}
							</div>
						</VirtualList>
					{:else if !filteredPossibleWords || filteredPossibleWords.length == 0}
						<div id="noPossibleWords">
							<img
								id="noWordsIcon"
								src="/src/assets/icons/nomatches.png"
								alt="No matching words."
							/>

							<p class="noWordsText">
								<strong>No matching words in our dictionary - sorry.</strong>
								<br />
								You can type new words into the bar above.
							</p>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
{:else}
	<Center><p>Click the grid to begin.</p></Center>
{/if}

<style lang="scss">
/* -------------------------------------------------------------------------- */

#wrapper {
	display: block;
	height: 100%;
	width: 100%;
	overflow: hidden;
}

#topArea {
	padding: 15px;
	height: 148px;
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 60px;
	grid-template-rows: repeat(2, 44px) 30px;
	grid-column-gap: 15px;
	grid-row-gap: 15px;
}

#possibleWordsArea {
	font-family: 'Courier Prime', 'Courier New', Courier, monospace;
	padding: 15px;
	flex: 1 0 auto;
	min-height: 200px;
	width: 100%;
	height: calc(100% - 148px);
	overflow: hidden;
	@include staticTransitionParent();
}

#possibleWordsWrapper {
	height: 100%;
	width: 100%;
	overflow: auto;
	@include staticTransitionChild();
}

.wordRow {
	display: grid;
	grid-template-columns: repeat(var(--cols), 1fr);
	grid-gap: 10px;
	margin: 5px 0px;
	padding-left: 5px;
	padding-right: 20px;
}

.possword {
	position: relative;
	background-color: var(--col);
	// add css for hovering button
	border: 1px solid var(--col);
	color: hsl(calc(var(--score) * 2), 75%, 20%);
	font-size: 1.2em;
	padding: 5px;
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;

	&.priorityWord {
		font-weight: bold;
		&:after {
			content: '⇧';
			position: absolute;
			right: 5px;
			font-size: 1.2em;
			color: rgb(0, 0, 0);
		}
	}

	&:after {
		counter-reset: score var(--score);
		content: counter(score);
		position: absolute;
		right: 5px;
		font-size: 0.7em;
		color: rgba(0, 0, 0, 0.278);
	}

	&:hover {
		background-color: hsl(calc(var(--score) * 2), 75%, 90%);
		color: hsl(calc(var(--score) * 2), 75%, 10%);
	}

	&:active {
		background-color: hsl(calc(var(--score) * 2), 75%, 60%);
		color: hsl(calc(var(--score) * 2), 75%, 10%);
	}

	&:global(.banned:before) {
		content: '!';
		width: 20px;
		height: 20px;
		color: white;
		font-size: 18px;
		line-height: 18px;
		margin-right: 5px;
		position: absolute;
		font-weight: bolder;
		top: -5px;
		left: 2px;
		border-radius: 50%;
		background-color: orange;
		z-index: 2;
		box-shadow: 5px 2px 10px rgba(0, 0, 0, 0.278);
	}
}

#noPossibleWords {
	display: flex;
	flex-direction: column;
	min-height: 200px;
	width: 100%;
	height: calc(100% - 148px);
	overflow: auto;
	justify-content: center;
	align-items: center;
}

#noWordsIcon {
	width: 50px;
	height: 50px;
}

.noWordsText {
	font-size: 75%;
}

#searchInput {
	padding: 0px 20px;
	&:after {
		margin-top: -5px;
		margin-left: -5px;
		content: '🔎︎';
		color: black;
		font-size: larger;
	}
}

#matchText {
	column-span: all;
	font-size: 80%;
	margin-left: 10px;
}
</style>
