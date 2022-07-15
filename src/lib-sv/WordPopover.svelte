<script lang="ts">
import { quadInOut } from 'svelte/easing';
import { fly } from 'svelte/transition';
import { Wave } from 'svelte-loading-spinners';
import { getThesaurus, getWord, scoreToColour } from '../lib/DictionaryEngine';
import Meanings from '../lib-sv/Meanings.svelte';
export let word = 'NO WORD ENTERED';
const wordinfo = getWord(word);
const thesaurus = getThesaurus(word);
const colour = scoreToColour(wordinfo.score);
</script>

<!----------------------------------------------------------------------HTML--->
<div class="popover">
	{#await thesaurus then thesaurusentry}
		<div
			class="content"
			transition:fly={{
				y: 20,
				duration: 200,
				easing: quadInOut,
			}}
		>
			<div class="topArea" style:--colour={colour}>
				<p class="titleWord">{word}</p>
				<p class="titleScore">{wordinfo.score}</p>
			</div>
			<div class="wordInfo">
				{#if thesaurusentry.numberOfSenses > 0}
					<Meanings meanings={thesaurusentry} />
				{:else}
					<div class="error">
						<b>Sorry, no definitions found.</b><br /> It could be a phrase,
						or proper noun without punctuation.
					</div>
				{/if}
			</div>
		</div>
	{/await}
	<div id="arrow" data-popper-arrow />
</div>

<!----------------------------------------------------------------------CSS----->
<style lang="scss">
$popovercolor: white;

.popover {
	background-color: $popovercolor;
	width: 300px;
	max-height: 500px;
	display: block;
	background-color: rgba(0, 0, 0, 0);

	.content {
		opacity: 1;
		background-color: $popovercolor;
		box-shadow: 10px 20px 30px rgba(0, 0, 0, 0.435);
		border-radius: 5px;
		overflow: hidden;
		width: 100%;
		height: 100%;
		display: block;
	}

	.topArea {
		padding: 0px;
		margin: 0px;
		width: 100%;
		height: 40px;
		background-color: var(--colour);
		display: block;
		//box-shadow: 1px 3px 10px rgba(103, 103, 103, 0.279);
		border-bottom: 1px solid gray;

		.titleWord {
			float: left;
			font-size: 22px;
			color: black;
			height: 40px;
			padding: 0 20px;
			margin: 0px;
			line-height: 40px;
		}

		.titleScore {
			float: right;
			font-size: 22px;
			color: grey;
			padding: 0px;
			margin: 0px 20px;
			height: 100%;
			line-height: 40px;
		}
	}

	.wordInfo {
		width: 100%;
		max-height: 400px;
		overflow-y: auto;
	}

	.error {
		height: max-content;
		color: hsl(0, 70%, 60%);
		font-size: 12px;
		text-align: center;
		padding: 10px;
	}
}

#arrow::before {
	background-color: white !important;
	content: '';
	transform: rotate(45deg);
}

#arrow,
#arrow::before {
	position: absolute;
	width: 2px;
	height: 2px;
	background-color: white;
	z-index: -1;
	box-shadow: 2px 2px 10px black;
}

:global(.popover[data-popper-placement^='bottom'] > #arrow) {
	top: -4px;
}

:global(.popover[data-popper-placement^='top'] > #arrow) {
	bottom: -4px;
}

:global(.popover[data-popper-placement^='left'] > #arrow) {
	right: -4px;
}

:global(.popover[data-popper-placement^='right'] > #arrow) {
	left: -4px;
}
</style>
