<script lang="ts">
import GridModal from './../modals/GridModal.svelte';
import DictionaryModal from '../modals/DictionaryModal.svelte';
import { Save, Load } from '../lib/FileManager';
import { changeLayout, clearGrid } from '../StateMediator.svelte';
import Modal from '../modals/Modal.svelte';

const save = () => Save.stateToFile();
const resetGrid = (event: MouseEvent) => clearGrid();
const changeGrid = (event: MouseEvent) => {
	let node = event.target as HTMLElement;
	let layout = Load.defaultLayouts?.[node.id];
	if (!layout) {
		console.error(`Layout ${node.id} not found`);
		return;
	}
	changeLayout(layout);
};

let showGridModal = false;
let showDictionaryModal = false;

const openGridModal = () => (showGridModal = true);
const closeGridModal = () => (showGridModal = false);
const openDictionaryModal = () => (showDictionaryModal = true);
const closeDictionaryModal = () => (showDictionaryModal = false);
</script>

<!----------------------------------------------------------------------HTML--->
<div id="page">
	<div class="row">
		<span>▩ Grid</span>
		<div class="buttonrow">
			<button on:click={openGridModal}>▦ Change</button>
			<button on:click={resetGrid}>🗑 Clear</button>
		</div>
	</div>

	<div class="row">
		<span>🕮 Dictionary</span>
		<div class="buttonrow">
			<button>＋ Upload</button>
			<button on:click={openDictionaryModal}>✎ Edit</button>
		</div>
	</div>
	<div class="row">
		<span>🗄 Files</span>
		<div class="buttonrow">
			<button>🖫 Save As</button>
			<button on:click={openGridModal}>🗁 Load</button>
		</div>
	</div>
	<div />
	<label>
		<input type="checkbox" disabled />
		<p>Autosave on Edit</p>
	</label>
</div>

{#if showGridModal}
	<Modal on:close={closeGridModal}>
		<GridModal />
	</Modal>
{/if}

{#if showDictionaryModal}
	<Modal on:close={closeDictionaryModal}>
		<DictionaryModal />
	</Modal>
{/if}

<style lang="scss">
#page {
	@include scroll();
	width: 100%;
	height: 100%;
	@include flex-col(stretch, space-around);
	grid-gap: 15px;
	padding: 20px;
}

.row {
	width: 100%;
	display: block;
	flex: 0 0 auto;

	span {
		width: 100%;
		font-size: 1.5em;
		font-weight: bold;
		text-align: center;
		flex: 1 0 100%;
		height: 60px;
		line-height: 60px;
	}

	.buttonrow {
		display: flex;
		button {
			flex: 1 0 auto;
			font-size: 1.2em;
			padding: 10px;
			border: 1px solid #000;
			border-radius: 5px;
			margin: 10px;
			background-color: #fff;
			color: #000;
			cursor: pointer;

			&:hover {
				background-color: rgb(231, 231, 231);
				color: rgb(111, 109, 109);
			}
			&:active {
				background-color: rgb(194, 192, 192);
				color: #000;
			}
		}
	}
}

label {
	display: inline-flex;
	column-span: 2;
	width: 150%;
	line-height: 0px;
	& > * {
		margin-right: 20px;
	}

	input:disabled + p {
		color: #ccc;
	}
}
</style>
