<script lang="ts">
import { priorityWords, dictionary } from '../StateMediator.svelte';

let newWordInput = '';

const addWord = () => {
	if (newWordInput.trim().length === 0) return;
	
	// Split by commas and process each word
	const wordsToAdd = newWordInput
		.split(',')
		.map(word => word.trim().replaceAll(/[^A-Za-z]/g, '').toUpperCase())
		.filter(word => word.length > 0 && !$priorityWords.includes(word));
	
	if (wordsToAdd.length > 0) {
		// Use the set method on the store to ensure reactivity
		priorityWords.set([...$priorityWords, ...wordsToAdd]);
		newWordInput = '';
	}
};

const removeWord = (word: string) => {
	// Use the set method on the store to ensure reactivity
	priorityWords.set($priorityWords.filter(w => w !== word));
};
</script>

<div class="component">
	<div class="title">Your Top Words:</div>

	<div class="priorityWords">
		{#each $priorityWords as word}
			<div class="priorityWord" class:notInDict={!$dictionary.has(word)}>
				<p>{word}</p>
				<button
					class="deleteWord"
					on:click={() => removeWord(word)}
				>
					x
				</button>
			</div>
		{/each}
	</div>

	<div class="wordAdder">
		<textarea 
			placeholder="Enter words separated by commas..." 
			bind:value={newWordInput}
			on:keydown={(e) => e.key === 'Enter' && e.ctrlKey && addWord()}
		></textarea>
		<button on:click={addWord}>+ Add</button>
	</div>
</div>

<style lang="scss">
.component {
	width: 100%;
	max-width: 500px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;

	& > div {
		margin: 10px;
		padding: 10px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}

	.title {
		font-size: 20px;
		text-align: center;
	}

	.priorityWords {
		border: 1px solid lightgray;
		width: 100%;
		max-height: 40vh;
		overflow-y: auto;
	}

	.priorityWord {
		border: 1px solid grey;
		border-radius: 5px;
		padding: 3px;
		margin: 3px;

		display: flex;
		flex-direction: row;
		align-items: space-between;
		justify-content: center;

		&.notInDict {
			border: 1px solid red;
		}

		.deleteWord {
			font-size: 1.2em;
			color: grey;
			border-radius: 50%;
			border: 1px solid lightgray;
			cursor: pointer;
			transition: all 0.1s ease;
			background-color: rgb(255, 255, 255);
			opacity: 0.6;
			&:active {
				opacity: 0.6;
			}
			&:hover {
				transition: none;
				background-color: hsl(1, 95%, 95%);
			}
		}
	}

	.wordAdder {
		width: 100%;
		display: flex;
		flex-direction: column;
		
		textarea {
			flex: 1 0 auto;
			height: 60px;
			max-height: 120px;
			margin-bottom: 10px;
			resize: vertical;
		}

		button {
			align-self: flex-end;
			flex: 0 0 50px;
			background-color: hsl(108, 92%, 95%);
			color: #000;
			border-radius: 5px;
			border: 1px solid lightgray;
			cursor: pointer;
			transition: all 0.1s ease;
			&:active {
				opacity: 0.6;
			}
			&:hover {
				background-color: hsl(117, 100%, 73%);
			}
		}
	}
}
</style>
