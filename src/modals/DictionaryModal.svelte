<script lang="ts">
import DictionaryEditor from './DictionaryEditor.svelte';
import { writable } from 'svelte/store';
import { dictionary, dictionaryName } from '../StateMediator.svelte';
import { Load } from '../lib/FileManager';
import { downloadMapAsDictFile, mapToDictBlob, saveBlobAs } from '../lib/utils';
/* -------------------------------------------------------------------------- */

const closeModal = () => (document.querySelector('.modal-background') as HTMLElement).click();
let selectedTab = 1;
let uploadedFiles = [];
let uploadedFileWordCount = [];
Load.defaultDictionaryFile().then(d => (uploadedFiles = [d]));
$: currentDictionaryBlob = mapToDictBlob($dictionary);
$: currentDictionarySize = Math.floor(currentDictionaryBlob.size / 1000).toLocaleString() + ' KB';
let replaceOrMerge = 'merge';
$: changeDictionaryText = replaceOrMerge == 'merge' ? '⥅ Merge' : '↷ Replace';
const downloadCurrentDictionary = () => saveBlobAs(currentDictionaryBlob, $dictionaryName);

const addDictionaryFile = (event: Event) => {
	const file = (event.currentTarget as HTMLInputElement).files?.[0];
	if (!file) return;
	uploadedFiles = [...uploadedFiles, file];
	console.log('ADDED FILE: ', file.name, file.size + ' B');
};
</script>

<div class="tabRow">
	<button on:click={() => (selectedTab = 1)} class:select={selectedTab == 1}>🕮 Manage</button>
	<button on:click={() => (selectedTab = 2)} class:select={selectedTab == 2}>✎ Edit</button>
</div>

<div class="content">
	{#if selectedTab == 1}
		<!--================================= TAB 1 ===============================-->

		<div class="currentDictionary box">
			<h2>Current Dictionary</h2>
			<div class="row">
				<p>Name:</p>
				<input type="text" bind:value={$dictionaryName} />
			</div>
			<p>{currentDictionarySize}</p>
			<p>{$dictionary.size.toLocaleString() + ' words'}</p>
			<div class="downloadButton" on:click={downloadCurrentDictionary}>Download as .dict</div>
		</div>

		<div class="editDictionary box">
			<h2>Change or Add</h2>
			<h3>1. Pick a Dictionary</h3>
			<div class="fileArea editArea">
				{#each uploadedFiles as file, index}
					<label class="fileLabel" for="radio{index}">
						<input type="radio" id="radio{index}" name="file" value={index} checked />
						<p class="filename">{file.name || 'unnamed file'}</p>
						<p class="filesize">{~~(file.size / 1000) + 'kB'}</p>
						<p class="numberofwords" />
					</label>
				{/each}

				<label class="fileUploadWrapper">
					<input type="file" accept=".dict,.txt" on:change={addDictionaryFile} hidden />
					<p class="uploadButton">+ Upload</p>
				</label>
			</div>

			<h3>2. Options</h3>
			<div class="optionArea editArea">
				<input
					type="radio"
					name="replaceOrMerge"
					bind:group={replaceOrMerge}
					value="merge"
				/>
				Merge with current dictionary
				<br />
				<input
					type="radio"
					name="replaceOrMerge"
					bind:group={replaceOrMerge}
					value="replace"
				/>
				Replace entirely
				<br />
				<hr />

				{#if replaceOrMerge == 'merge'}
					<input type="checkbox" id="overwrite" />
					Overwrite word scores
					<br />
				{/if}
				<input type="number" id="defaultScore" value="50" />
				Default score for unscored words
				<small>(0-100)</small>
				<br />

				<!-- <label class="checkOption" for="overwrite">
					<input type="checkbox" id="overwrite" />
					<p>Overwrite word scores</p>
				</label>
				<label class="numberOption" for="defaultScore">
					<input type="number" id="defaultScore" value="50" />
					<p>Default score</p>
				</label> -->
			</div>

			<div class="changeDictionary row">
				<button class="changeButton">{changeDictionaryText}</button>
			</div>
		</div>

		<!-- <input type="file" on:change={enableUpload}/>
        <input type="checkbox" bind:checked="{shouldOverwrite}"/>Overwrite current Entries? -->
		<!-- <button class=uploadButton disabled={disableUpload}>Upload</button>
		<button class="saveButton">🖫 Download as .dict</button> -->

		<!--================================= TAB 2 ===============================-->
	{:else}
		<DictionaryEditor />
	{/if}
</div>

<style lang="scss">
.tabRow {
	display: flex;
	width: 90%;
	justify-content: start;
	margin-bottom: 10px;
	border-bottom: 1px solid black;

	& > button {
		font-size: 1.2em;
		color: grey;
		border-radius: 1px;
		border: none;
		cursor: pointer;
		transition: all 0.1s ease;
		padding: 10px 20px;

		&:not(.select) {
			opacity: 0.6;
			background-color: rgb(255, 255, 255);
		}

		&:active {
			opacity: 0.6;
		}

		&.select {
			color: #000;
			background-color: rgb(235, 235, 235);
		}

		&:hover {
			transition: none;
			outline: 1px solid black;
		}
	}
}

.content {
	display: block;
	width: min(1000px, 80vw);
	height: min(800px, 85vh);
}

.box {
	position: relative;
	display: block;
	padding: 10px;
	border: 1px solid black;
	border-radius: 5px;
	margin: 50px 10px;
	padding: 20px 10px;

	h2 {
		position: absolute;
		top: -40px;
		left: 10px;
		background-color: white;
		padding: 0px 30px;
	}

	&.currentDictionary {
		position: relative;

		p {
			margin: 10px;
		}

		& > .row {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: stretch;
			width: 100%;
			margin-bottom: 10px;
			input {
				width: 80%;
			}
		}

		.downloadButton {
			position: absolute;
			bottom: 0;
			right: 0;
			padding: 10px;
			margin: 30px;
			box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.3);
			border-radius: 4px;
			font-size: large;
			background-color: #fff;
			transition: all 0.2s ease-out;
			cursor: pointer;
			&:hover {
				transform: scale(1.2);
				box-shadow: 3px 10px 20px rgba(0, 0, 0, 0.1);
			}
		}
	}

	&.editDictionary {
		display: flex;
		flex-direction: column;
		h3 {
			color: gray;
		}

		.optionArea > label {
			display: flex;
			flex-direction: row;
		}

		.changeButton {
			font-size: 1.3em;
		}
	}
}

.fileArea {
	position: relative;
	border: 2px solid black;
	border-radius: 5px;
	padding: 10px;
	margin-bottom: 10px;
	flex: 1 0 auto;

	.fileUploadWrapper {
		.uploadButton {
			border: 1px solid gray;
			border-radius: 3px;
			padding: 15px;
			float: right;
			transition: all 0.2s ease-out;
			box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);

			&:hover {
				cursor: pointer;
				transform: scale(1.1);
			}
		}
	}
}

.fileLabel {
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 100px 200px;
	justify-content: stretch;
	outline: 1px solid black;

	input {
		display: none;
	}

	input[type='radio'] ~ p {
		margin: 0px;
		padding: 5px 10px;
		cursor: pointer;
	}

	&:hover {
		background-color: rgba(231, 255, 213, 0.31);
	}

	input[type='radio']:checked ~ p {
		background-color: rgb(231, 255, 213);
		color: green;
	}
}
</style>
