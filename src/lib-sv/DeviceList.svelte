<script lang="ts">
import VirtualList from '@sveltejs/svelte-virtual-list';
import { createEventDispatcher } from 'svelte';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* -------------------------------------------------------------------- Props */
export let name = '';
export let subComponent;
export let index: number;
export let list = [];
export let number = list?.length || 0;
export let useVirtualList = true;
export let maxHeight;
export let isOpen = false;

/* -------------------------------------------------------- Events, Animation */

let dispatch = createEventDispatcher();
function onClick() {
	dispatch('opened', index);
}

$: listHeight = maxHeight - 30 * 3 + 'px';

let animate = '';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
</script>

<details
	bind:open={isOpen}
	class="deviceDropdown {animate}"
	on:click={onClick}
	on:introend={() => (animate = 'animate')}
	disabled={number != 0 ? true : false}
>
	<summary> <span>{name} ({list.length})</span></summary>

	<div class="listContainer" style:height={listHeight}>
		{#if useVirtualList}
			<VirtualList items={list} let:item>
				<svelte:component this={subComponent} device={item} />
			</VirtualList>
		{:else}
			<svelte:component this={subComponent} meanings={list} />
		{/if}
	</div>
</details>

<style>
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
details {
	height: 30px;
	width: 100%;
	overflow: hidden;
}

details.animate {
	transition: all 200ms ease;
}

details[open] {
	height: calc(100% - 70px);
	border-radius: 2px;
}

details:not([open]) {
	/* transition: none; */
	background-color: rgb(225, 225, 225);
}

summary {
	width: 100%;
	height: 10px;
	padding: 10px;
}

.listContainer {
	width: 100%;
	padding: 5px;
}
</style>
