<script lang="ts">
import VirtualList from '@sveltejs/svelte-virtual-list';
import { createEventDispatcher } from 'svelte';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* -------------------------------------------------------------------- Props */
export let name = '';
export let subComponent: any;
export let index: number;
export let list: IDevice[]; 
export let defs: IThesaurusEntry;
export let useVirtualList = true;
export let maxHeight;
export let isOpen = false;
let numberOfEntries: number|IDevice[];
$: numberOfEntries == (list) ? list.length : defs?.numberOfSenses || 0
$: isEnabled = numberOfEntries == 0 ? "disabled" : "";
$: listHeight = maxHeight - 30 * 3 + 'px';

/* -------------------------------------------------------- Events, Animation */

let dispatch = createEventDispatcher();
function onClick() {
	dispatch('opened', index);
}
let animate = '';
</script>
<!----------------------------------------------------------------------HTML--->

<details
	bind:open={isOpen}
	class="deviceDropdown {animate} {isEnabled}"
	on:click={onClick}
	on:introend={() => (animate = 'animate')}
>
	<summary> <span>{name} ({list.length})</span></summary>

	<div class="listContainer" style:height={listHeight}>
		{#if useVirtualList}
			<VirtualList items={list} let:item>
				<svelte:component this={subComponent} device={item} />
			</VirtualList>
		{:else}
			<svelte:component this={subComponent} meanings={defs} />
		{/if}
	</div>
</details>

<!----------------------------------------------------------------------CSS----->
<style lang="scss" global>

details {
	height: 30px;
	width: 100%;
	overflow: hidden;

    &.animate {
        transition: all 200ms ease;
    }

    &[open] {
	    height: calc(100% - 70px);
	    border-radius: 2px;
    }

    &:not([open]) {
	/* transition: none; */
	    background-color: rgb(225, 225, 225);
    }

    &.disabled {
        max-height: 30px;
        background-color: grey;
        opacity: 0.3;
        pointer-events: none;
    }
}


summary {
	width: 100%;
	height: 10px;
	padding: 10px;
    cursor:pointer;
    user-select:none;
}

.listContainer {
	width: 100%;
	padding: 5px;
}


</style>
