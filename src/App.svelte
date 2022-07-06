<script lang="ts">
import Grid from './Grid.svelte';
import Panel from './Panel.svelte';
import { Load } from './lib/FileManager';
import { writable, derived } from 'svelte/store';
import StateMediator, {
	dictionary,
	gridTemplate,
	wordSlots,
} from './StateMediator.svelte';
import { Square } from 'svelte-loading-spinners';
/* -------------------------------------------------------------------------- */

// Startup
$wordSlots = Load.lastSlots as IWordSlot[] | null;

let templatePromise = Load.lastOrDefaultLayout();
templatePromise.then(t => ($gridTemplate = t));

let dictionaryPromise = Load.lastOrDefaultDictionary();
dictionaryPromise.then(d => ($dictionary = d));
/* ------------------------------------------------------------------------ */
</script>

<StateMediator />

{#await Promise.all([dictionaryPromise, templatePromise])}
	<div class="centre">
		<Square size="60" color="#000000" unit="px" duration="1s" />
	</div>
{:then}
	<div id="main">
		<div id="gridArea">
			<Grid />
		</div>

		<div id="panelArea">
			<Panel />
		</div>
	</div>
{/await}

<style lang="scss">
/* -------------------------------------------------------------------------- */

* {
	box-sizing: border-box;
	font-family: 'Courier New', Courier, monospace;
}

.centre {
	@include centredParent();
	@include fillParent();
}

@media (min-width: 800px) {
	#main {
		position: absolute 0 0;
		width: 100vw;
		height: 100vh;
		overflow-y: auto;
		display: flex;
		flex-wrap: nowrap;
		padding: 20px;
		align-items: center;
	}

	#gridArea {
		flex: 1 0 400px;
		max-width: 800px;
		padding-right: 15px;
	}

	#panelArea {
		flex: 1 1 300px;
		height: 100%;
	}
}

@media (max-width: 799px) {
	#main {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		align-items: center;
		justify-items: center;
	}

	#gridArea {
		height: 40%;
		display: flex;
		justify-content: center;
		width: 100%;
		flex: 1 0 1fr;
	}

	#panelArea {
		width: 90%;
		flex: 1 1 auto;
		margin: 20px;
		margin-top: 15px;
	}
}
</style>
