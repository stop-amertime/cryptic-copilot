<script lang="ts">
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import { createEventDispatcher } from "svelte";

export let name = "";
export let subComponent;
export let index: number; 
export let list = [];
export let number = list?.length || 0; 
export let useVirtualList = true; 

export let maxHeight;
let isOpen;
let dispatch = createEventDispatcher()
function onClick(){
    dispatch('opened', index);
}

$: listHeight = (maxHeight - (40 * 2)) + "px"
</script>

<details 
class="deviceDropdown"
on:click={onClick} 
disabled='{number != 0 ? true : false}'>

    <summary> <span>{name} ({list.length})</summary> 

    <div class="listContainer" 
    style:height={listHeight}>

    {#if useVirtualList}
        <VirtualList items={list} let:item>
            <svelte:component this={subComponent} device={item}/>
        </VirtualList>

    {:else}
        <svelte:component this={subComponent} content={list}/>
    
    {/if}
    </div>

</details>


<style>

details {
    height: 30px;
    width: 100%;
    padding-top: 10px;
    transition: height 300ms ease;
    overflow:hidden;
}

details[open]{
    height: calc(100% - 50px);
    transition: height 300ms ease;
}


summary {
    width: 100%;
    height: 30px;
}

span {
    padding: 5px 10px;
    width: 100%;
}

.listContainer {
    width: 100%;
    padding: 5px;
    transition:height 1000ms ease-out;
}

</style>