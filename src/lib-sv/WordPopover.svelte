<script lang="ts">
import { quadInOut } from 'svelte/easing';
import { fly } from 'svelte/transition';
import { Wave } from 'svelte-loading-spinners';
import { getThesaurus, getWord, scoreToColour } from '../lib/DictionaryEngine';
import Meanings from '../panels/infopanels/Meanings.svelte';
export let word = 'NO WORD ENTERED';
let opacity = 0;
const wordinfo = getWord(word);
const thesaurus = getThesaurus(word);
thesaurus.then(t => (opacity = 1));
const colour = scoreToColour(wordinfo.score);
</script>

<!----------------------------------------------------------------------HTML--->

<div class="popover" style:opacity>
	{#await thesaurus then thesaurusentry}
		<div class="content">
			<div class="topArea" style:--colour={colour}>
				<p class="titleWord">{word}</p>
				<p class="titleScore">{wordinfo.score}</p>
			</div>
			<div class="wordInfo">
				{#if thesaurusentry.numberOfSenses > 0}
					<Meanings data={thesaurusentry} />
				{:else}
					<div class="error">
						<b>Sorry, no definitions found.</b>
						<br />
						It could be a phrase, or proper noun without punctuation.
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
	width: 400px;
	max-height: 500px;
	display: block;
	background-color: rgba(0, 0, 0, 0);
	transition: opacity 0.2s ease;
	filter: drop-shadow(5px 10px 20px rgba(128, 128, 128, 0.8));

	.content {
		opacity: 1;
		background-color: $popovercolor;
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
		background-color: white;
		display: block;
		border-bottom: 1px solid rgb(225, 225, 225);

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
			padding: 0px;
			margin: 0px 20px;
			height: 100%;
			line-height: 40px;
			font-style: bold;
		}
	}

	.wordInfo {
		width: 100%;
		max-height: 400px;
		overflow-y: auto;
		padding: 15px;
	}

	.error {
		height: max-content;
		color: hsl(0, 0%, 72%);
		font-size: 12px;
		text-align: center;
		padding: 30px;
	}
}

#arrow::before {
	background-color: white !important;
	content: '';
	transform: rotate(45deg);
	z-index: -1;
}

#arrow,
#arrow::before {
	position: absolute;
	content: '';
	width: 15px;
	height: 15px;
	background-color: none;
	z-index: -1;
}

:global(.popover[data-popper-placement^='bottom'] > #arrow) {
	top: -5px;
}

:global(.popover[data-popper-placement^='top'] > #arrow) {
	bottom: -5px;
}

:global(.popover[data-popper-placement^='left'] > #arrow) {
	right: -5px;
}

:global(.popover[data-popper-placement^='right'] > #arrow) {
	left: -5px;
}
</style>
