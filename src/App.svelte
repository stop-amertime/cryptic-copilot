<script lang="ts">
import Panel from './Panel.svelte';
import Grid from './Grid.svelte';
import { Square } from 'svelte-loading-spinners';
import { onMount } from 'svelte';
import { writable, derived } from 'svelte/store';

/* ========================================================================== */

let loading = true;
let StateMediator;
onMount(() => {
	import('./StateMediator.svelte').then(s => (StateMediator = s.default));
});
///
</script>

<!----------------------------------------------------------------------HTML--->
<template lang="pug">
+if('loading')
    .centre: Square(size="60" color="#000000" unit="px" duration="2s")
    +else()
        #main
            #gridArea: Grid
            #panelArea: Panel

svelte:component(this='{StateMediator}' on:isLoading!='{(event)=>{loading=event.detail}}')
</template>

<!----------------------------------------------------------------------CSS----->
<style lang="scss" global>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

* {
	box-sizing: border-box;
	font-family: 'Fira Code', monospace;
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
		padding: 30px 10%;
		overflow-y: auto;
		display: flex;
		flex-wrap: nowrap;
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
