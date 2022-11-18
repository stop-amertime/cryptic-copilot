<script lang="ts">
import { scoreToColour } from '../../lib/DictionaryEngine';
import WordPopover from '../../lib-sv/WordPopover.svelte';
import { popover } from '../../lib/wordPopover';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
export let data: IDevice = {
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
	{#each data.words as i}
		<button
			use:popover={{ component: WordPopover, word: i.word }}
			style:--color={scoreToColour(i?.score)}
			class:abbr={i.abbreviationFor || i.word.length == 1}
			class="word {i.direction} outer"
		>
			<!-- {#if i.direction}
				<div class="directionsymbol">
					{i.direction == 'anagram' ? '≈' : '⇠'}
				</div>
			{/if} -->
			{i.word}

			{#if i.contains}{#each i.contains as j}
					<button
						use:popover={{ component: WordPopover, word: j.word }}
						style:--color={scoreToColour(j?.score)}
						class="word {j.direction} inner"
						class:abbr={i.abbreviationFor || i.word.length == 1}
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
	height: 63px;
	padding: 0px 3px;
}

@mixin floatinglabel {
	position: absolute;
	color: rgb(153, 148, 148);
	float: left;
	text-align: left;
	//border: 1px solid gray;
}

.word {
	display: inline-block;
	position: relative;
	font-size: 14px;
	font-family: 'Courier Prime', Courier, monospace;
	font-weight: normal;
	margin-bottom: 15px;
	margin-left: -1px;
	padding: 5px 15px;
	border-radius: 2px;
	border: none;
	border: 1px solid rgb(193, 193, 193);
	cursor: pointer;
	text-transform: lowercase;
	background-color: var(--color);

	@include hoverEffect();

	&:active {
		opacity: 0.4;
		transition: all 0.2s ease;
	}
	overflow: visible;
	transition: all 0.2s ease;

	// .directionsymbol {
	// 	display: inline-block;
	// 	font-size: 20px;
	// 	color: rgb(105, 95, 95);
	// 	padding: 0px 2px;
	// 	margin: 0px;
	// }

	&.anagram:before {
		content: '⟳';
		font-size: 14px;
		top: -2px;
		left: 2px;
		@include floatinglabel;
	}

	&.reverse:before {
		content: '🡠';
		font-size: 12px;
		top: -2px;
		left: 2px;
		@include floatinglabel;
	}
}

.inner {
	height: 95%;
	margin: 0px;
	padding: 0px 15px;
	box-shadow: 3px 3px 3px 0px rgba(54, 54, 54, 0.1);
}

.abbr {
	text-transform: uppercase !important;
}
</style>
