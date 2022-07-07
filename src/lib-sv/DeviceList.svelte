<script lang="ts">
import VirtualList from '@sveltejs/svelte-virtual-list';
import { createEventDispatcher } from 'svelte';
/* -------------------------------------------------------------------- Props */
export let listProps;
export let listHeights : {head:number, inner:number};
export let list = null as IDevice[];  
export let definition = null as IThesaurusEntry;
export let isOpen;
const dispatch = createEventDispatcher();
let animate = '';
const {name, subComponent, index} = listProps;
$: numberOfEntries = list ? list.length : definition?.numberOfSenses ?? 0
$: disabledClass = (numberOfEntries == 0) ? "disabled" : "";

console.table({listHeights,numberOfEntries, isOpen: isOpen })


const clicked = (event) => {
    dispatch('opened', index);
    console.table({listHeights, numberOfEntries, isOpen: isOpen })
}
</script>
<!----------------------------------------------------------------------HTML--->

<details
	bind:open={isOpen}
	class="deviceDropdown {animate} {disabledClass}"
	on:click="{clicked}"
	on:introend={() => (animate = 'animate')}
>
        <summary style:height={listHeights.head +"px"}> <span>{name} ({numberOfEntries})</span></summary>

        <div class="listContainer" style:height="{listHeights.inner + "px"}">
            {#if !!list}
                <VirtualList items={list} let:item>
                    <svelte:component this={subComponent} device={item} />
                </VirtualList>

            {:else if !!definition}
                <svelte:component this={subComponent} meanings={definition} />

            {/if}
        </div>

</details>

<!----------------------------------------------------------------------CSS----->
<style lang="scss" global>

details {
	width: 100%;
	overflow: hidden;

    &.animate {
        transition: all 200ms ease;
    }

    &[open] {
	    border-radius: 2px;
    }

    &:not([open]) {
	    background-color: rgb(225, 225, 225);
    }

    &.disabled {
        background-color: grey;
        opacity: 0.3;
        pointer-events: none;
    }
}


summary {
	width: 100%;
	height: 30px;
	padding: 10px;
    cursor:pointer;
    user-select:none;
}

.listContainer {
	width: 100%;
	padding: 5px;
    overflow-y: hidden;
}


</style>
