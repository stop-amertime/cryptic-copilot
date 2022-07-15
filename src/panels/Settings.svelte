<script lang="ts">
import { Save, Load } from '../lib/FileManager';
import { changeLayout } from '../StateMediator.svelte';
import Modal from '../Modals/Modal.svelte';

const save = () => Save.stateToFile();

const changeGrid = (event: MouseEvent) => {
	let node = event.target as HTMLElement;
	let layout = Load.defaultLayouts?.[node.id];
	if (!layout) {
		console.error(`Layout ${node.id} not found`);
		return;
	}
	changeLayout(layout);
};

let showModal = false;
const openModal = () => (showModal = true);
const closeModal = () => (showModal = false);
</script>

<!-- 

.settings to have:

StateMediator: 
        Settings {
            autosave: true
            use dictionary scores: ?
            colour settings? 
        }

---- SAVE AND LOAD 
        - Save (as)
        - Load 
        - Toggle Autosave? 

-----GRID 
        - Pick one (from modal)
        - **Make new? 
        - Bin grid
        - Save/Load   

----DICTIONARY 
        - Load a dictionary 
            (gets saved to localstorage)

--->
<div id="page">
	<div id="saveLoadArea">
		<button id="0" on:click={changeGrid}> Change Grid to 0 </button>
		<button id="1" on:click={changeGrid}> Change Grid to 1 </button>
		<button id="2" on:click={changeGrid}> Open Modal </button>
		<button id="openModal" on:click={openModal}> Open Modal </button>
	</div>
</div>

{#if showModal}
	<Modal on:close={closeModal}>
		<h1>Modal</h1>
	</Modal>
{/if}

<style lang="scss">
#saveLoadArea {
	width: 100%;
	height: 20%;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
	margin-top: 20px;
}

button {
	font-size: 1.2em;
	padding: 10px;
	border: 1px solid #000;
	border-radius: 5px;
	margin: 10px;
	background-color: #fff;
	color: #000;
	cursor: pointer;

	//add colouring on hover and click
	&:hover {
		background-color: rgb(194, 192, 192);
		color: rgb(111, 109, 109);
	}
	&:active {
		background-color: rgb(231, 231, 231);
		color: #000;
	}
}
</style>
