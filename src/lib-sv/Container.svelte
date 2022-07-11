<script lang="ts">
import { scoreToColour } from './../lib/DictionaryEngine';
import Popover from 'svelte-popover';
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
			style:background-color={scoreToColour(i?.score)}
			class:abbr={i.isAbbreviation}
			class="word {i.direction} outer"
		>
			{i.word}

			{#if i.contains}{#each i.contains as j}
					<button
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

:global(.word) {
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
	overflow: visible;
}

:global(.inner) {
	height: 40px;
	line-height: 40px;
	box-shadow: inset 0px 3px 10px rgba(54, 54, 54, 0.39);
	padding: 0px 10px;
}

:global(.word.abbr) {
	font-style: italic;
}

@mixin floatinglabel {
	color: rgb(0, 0, 0);
	position: absolute;
	top: -2px;
	left: -2px;
	width: 18px;
	height: 20px;
	float: left;
	font-style: bold;
	font-size: 14px;
	font-style: normal;
	line-height: 20px;
	text-align: center;
	vertical-align: center;
	// background-color:rgba(247, 247, 247, 0.685);
	border-radius: 20px;
	// border: 0.5px solid gray;
	// box-shadow: 3px 5px 6px rgba(128, 128, 128, 0.435);
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
