<script lang="ts">
import WordPopover from './WordPopover.svelte';
import { scoreToColour } from './../lib/DictionaryEngine';
import { popover } from './../lib/wordPopover';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
export let device: IDevice = {
	words: [
		{ word: 'ABC', score: 50, direction: 'word' },
		{ word: 'DEF', score: 50, direction: 'word reverse' },
		{
			word: 'AA',
			score: 50,
			direction: 'word anagram',
			contains: [
				{ word: 'ABC', score: 50, direction: 'word' },
				{ word: 'DEF', score: 50, direction: 'word reverse' },
			],
		},
	],
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
</script>

<div class="device">
	{#each device.words as i}
		<button
			use:popover={{ component: WordPopover, word: i.word }}
			style:background-color={scoreToColour(i?.score)}
			class:abbr={i.isAbbreviation}
			class="word {i.direction} outer"
		>
			{i.word}

			{#if i.contains}{#each i.contains as j}
					<button
						use:popover={{ component: WordPopover, word: j.word }}
						style:background-color={scoreToColour(j?.score)}
						class="word {j.direction} inner"
					>
						{j.word}
					</button>
				{/each}{/if}
		</button>
	{/each}
</div>

<style lang="scss">
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
:global(.device) {
	display: flex;
	align-items: stretch;
	height: 80px;
}

.word {
	display: inline-block;
	position: relative;
	font-size: 16px;
	font-family: 'Courier Prime', Courier, monospace;
	margin: 8px 2px;
	border-radius: 2px;
	border: 1px solid gray;
	cursor: pointer;
	&:hover {
		opacity: 0.8;
	}
	&:active {
		opacity: 0.4;
		transition: all 0.2s ease;
	}
	overflow: visible;
	text-transform: lowercase;
	transition: all 0.2s ease;
}

.inner {
	line-height: 40px;
	box-shadow: inset 2px 4px 2px rgba(54, 54, 54, 0.203);
	padding: 0px 10px;
}

.word.abbr {
	font-style: bolder;
}

.abbr {
	font-style: bolder;
	border: 1px solid black;
	opacity: 0.7;
	text-transform: uppercase;
}

@mixin floatinglabel {
	color: rgb(0, 0, 0);
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	float: left;
	font-style: bold;
	font-size: 14px;
	font-style: normal;
	line-height: 16px;
	text-align: center;
	vertical-align: center;
	background-color: rgba(247, 247, 247, 0.414);
	border-radius: 20px;
	//border: 0.5px solid gray;
	box-shadow: 1px 1px 3px rgba(128, 128, 128, 0.435);
	font-style: bolder;
}

:global(.anagram:before) {
	content: '⟳';
	@include floatinglabel;
}

:global(.reverse:before) {
	content: '\21A9  ';
	@include floatinglabel;
}
</style>
