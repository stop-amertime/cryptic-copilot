<script lang="ts">
import { Save, Load } from '../lib/FileManager';
import { changeLayout } from '../StateMediator.svelte';

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
	</div>
</div>

<style lang="scss">
#saveLoadArea {
	@include size(50px, 200px);
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
	margin-top: 20px;
}

button {
	font-family: 'Courier Prime', monospace;
	font-size: 1.5em;
	padding: 10px;
	border: 1px solid #000;
	border-radius: 5px;
	background-color: #fff;
	color: #000;
	cursor: pointer;
}

button:hover {
	opacity: 0.8;
}
</style>
