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
	<span>▩ Grid</span>
	<button on:click={openGridModal}>▦ Change</button>
	<button on:click={resetGrid}>🗑 Reset</button>
	<span>🕮 Dictionary</span>
	<button>＋ Upload</button>
	<button on:click={openDictionaryModal}>✎ Edit</button>
	<span>🗄 Files</span>
	<button>🖫 Save As</button>
	<button on:click={openGridModal}>🗁 Load</button>
	<div />
	<label style="column-span: 2">
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
	display: grid;
	grid-gap: 15px;
	grid-template-columns: 1fr 150px 150px;
	grid-template-rows: 70px 70px 70px 30px;
	grid-template-areas:
		'gridlabel gridbutton1 gridbutton2'
		'dictlabel dictbutton1 dictbutton2'
		'filelabel filebutton1 filebutton2'
		'_________ fileautosave fileautosave';
	padding: 20px;
}

span {
	font-size: 1.5em;
	font-weight: bold;
	text-align: left;
	flex: 1 0 auto;
	height: 60px;
	line-height: 60px;
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

button {
	width: 150px;
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
</style>
