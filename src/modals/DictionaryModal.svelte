<script lang="ts">
import { fly } from 'svelte/transition';
import DictionaryEditor from './DictionaryEditor.svelte';
import TopWords from './TopWords.svelte';
import { writable } from 'svelte/store';
import { dictionary, dictionaryName } from '../StateMediator.svelte';
import { Load } from '../lib/FileManager';
import { dictFileToMap, downloadMapAsDictFile, mapToDictBlob, saveBlobAs } from '../lib/utils';
/* -------------------------------------------------------------------------- */

const closeModal = () => (document.querySelector('.modal-background') as HTMLElement).click();
let selectedTab = 1;
let uploadedFiles = [];
let selectedFile = 0;
Load.defaultDictionaryFile().then(d => (uploadedFiles = [d]));
$: currentDictionaryBlob = mapToDictBlob($dictionary);
$: currentDictionarySize = Math.floor(currentDictionaryBlob.size / 1000).toLocaleString() + ' KB';
let replaceOrMerge = 'merge';
let newDictionaryName = '';
$: changeDictionaryText = replaceOrMerge == 'merge' ? '⥅ Merge' : '↷ Replace';
let defaultScore = 50;
let shouldOverwrite = true;
const downloadCurrentDictionary = () => saveBlobAs(currentDictionaryBlob, $dictionaryName);

const addDictionaryFile = (event: Event) => {
	const file = (event.currentTarget as HTMLInputElement).files?.[0];
	if (!file) return;
	uploadedFiles = [...uploadedFiles, file];
	selectedFile = uploadedFiles.length - 1;
};

const addFileToCurrentDictionary = async () => {
	let input = await dictFileToMap(uploadedFiles[selectedFile], defaultScore);
	let previous = replaceOrMerge == 'merge' ? $dictionary : new Map();
	let output = shouldOverwrite
		? new Map([...previous, ...input])
		: new Map([...input, ...previous]);
	$dictionaryName = newDictionaryName || 'Merged Dictionary';
	$dictionary = output;
};
</script>

<div class="tabRow">
	<button on:click={() => (selectedTab = 1)} class:select={selectedTab == 1}>🕮 Manage</button>
	<button on:click={() => (selectedTab = 2)} class:select={selectedTab == 2}>✎ Edit</button>
	<button on:click={() => (selectedTab = 3)} class:select={selectedTab == 3}>⭱ Top Words</button>
</div>

{#if selectedTab == 1}
	<!--================================= TAB 1 ===============================-->
	<div class="manageTab">
		<div class="currentDictionary box">
			<h2>Current Dictionary</h2>
			<div class="dictionaryDetails">
				<input type="text" bind:value={$dictionaryName} />
				<p>{currentDictionarySize}</p>
				<p>{$dictionary.size.toLocaleString() + ' words'}</p>
			</div>
			<div class="download button" on:click={downloadCurrentDictionary}>↓ Download</div>
		</div>

		<div class="editDictionary box">
			<h2>Change or Add</h2>
			<div class="fileArea editArea">
				{#each uploadedFiles as file, index}
					<label class="fileLabel" for="radio{index}">
						<input
							type="radio"
							id="radio{index}"
							name="file"
							value={index}
							bind:group={selectedFile}
							checked
						/>
						<p class="filename">{file.name || 'unnamed file'}</p>
						<p class="filesize">{~~(file.size / 1000) + 'kB'}</p>
						{#await file.text() then text}
							<p class="numberofwords">
								{text.split('\n').length.toLocaleString()} words
							</p>
						{/await}
					</label>
				{/each}
			</div>
			<label class="fileUploadWrapper">
				<input type="file" accept=".dict,.txt" on:change={addDictionaryFile} hidden />
				<div class="upload button">+ Upload</div>
			</label>
			<h3>Options</h3>
			<div class="optionArea mergeOrReplace">
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
			</div>
			<div class="optionArea mergeOptions">
				{#if replaceOrMerge == 'merge'}
					New Dictionary Name:
					<input
						type="text"
						placeholder="My Merged Dictionary"
						bind:value={newDictionaryName}
					/>
					<br />
					<label for="overwrite">
						<input type="checkbox" id="overwrite" bind:checked={shouldOverwrite} />
						Overwrite scores of current dictionary
						<br />
					</label>
				{/if}

				Default score:
				<input type="number" id="defaultScore" bind:value={defaultScore} />
				/100
				<br />
			</div>

			<div class="changeDictionary row">
				<button class="changeButton" on:click={addFileToCurrentDictionary}>
					{changeDictionaryText}
				</button>
			</div>
		</div>
	</div>
	<!--================================= TAB 2 ===============================-->
{:else if selectedTab == 2}
	<div class="editTab">
		<DictionaryEditor />
	</div>
{:else}
	<div class="topWordsTab">
		<TopWords />
	</div>
{/if}

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

.editTab {
	display: block;
	width: min(1000px, 80vw);
	height: min(800px, 85vh);
}

.manageTab {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	width: min(1000px, 80vw);
	height: 85vh;
}

.box {
	position: relative;
	display: block;
	padding: 0px 20px;
	margin: 10px 0px;

	h2 {
		padding: 20px 0px;
	}

	.button {
		position: absolute;
		top: 35px;
		right: 20px;
		width: 150px;
		text-align: center;
		padding: 10px;
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

	&.currentDictionary {
		position: relative;
		flex: 0 0 auto;
		border-bottom: 1px solid gray;

		.dictionaryDetails {
			display: flex;
			flex-direction: row;
			width: 100%;
			margin-bottom: 10px;
			margin: 0px;

			input {
				font-size: 1.3em;
				flex: 1 0 auto;
				margin: 10px;
			}

			p {
				font-size: 1.3em;
				margin: 10px;
				color: gray;
			}
		}
	}

	&.editDictionary {
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		h3 {
			color: gray;
			flex: 0 0 auto;
		}

		.optionArea {
			flex: 0 0 auto;
			margin-top: -1px;
			& > label {
				display: flex;
				flex-direction: row;
			}
		}

		.fileArea {
			position: relative;
			border: 2px solid black;
			border-radius: 5px;
			padding: 10px;
			margin-bottom: 10px;
			flex: 3 0 auto;
			overflow-y: scroll;

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
		}

		.mergeOrReplace {
			border: 1px solid gray;
			padding-left: 20px;
			line-height: 2;
		}

		.mergeOptions {
			border: 1px solid gray;
			padding-left: 70px;
			padding: 30px;
			line-height: 3;

			input[type='checkbox'] {
				width: 20px;
				margin-right: 20px;
			}

			input[type='number'] {
				width: 50px;
				font-size: 1em;
			}
		}

		.changeButton {
			font-size: 1.3em;
			padding: 10px;
			margin: 30px;
		}
	}
}
</style>
