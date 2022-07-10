<script lang="ts">
//import settings writable from StateMediator
import { Save } from '../lib/FileManager';

const save = () => Save.stateToFile();
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

//make a div with buttons to save and load settings

<div class="settings">
	<div class="save">
		<button>Save</button>
	</div>
	<div class="load">
		<button>Load</button>
	</div>
	<div class="autosave">
		<button>Autosave</button>
	</div>

	<div class="grid">
		<button>Grid</button>
	</div>
</div>

<p />
