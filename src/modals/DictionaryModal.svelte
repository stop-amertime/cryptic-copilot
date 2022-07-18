<script lang="ts">
/*
Needs to: 
    display table of dictionary words 
    edit and update the dictionary when table is changed
    allow sorting, filtering, multiselect? 
*/

import DictionaryTable from './DictionaryTable.svelte';
</script>

<div class="page">
	<h3>Edit the Dictionary</h3>

	<DictionaryTable />
</div>

<style>
.page {
	width: 800px;
	height: 1000px;
}
</style>
