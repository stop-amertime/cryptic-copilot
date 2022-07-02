<script lang="ts">
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import { createEventDispatcher } from "svelte";


export let name = "";
export let subComponent;
export let index: number; 
export let opened = false;
export let list = [];
export let number = list?.length || 0; 
export let useVirtualList = true; 
let dispatch = createEventDispatcher()
</script>

<details 
id="devicelist{index}" 
open={opened} 
on:focus={()=>dispatch('opened', "me!")} 
disabled='{number != 0 ? true : false}'>

    <summary> <span>{name} ({list.length})</summary> 

    <div class="listcontainer">
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
.listcontainer {
    height: 300px;
    width: 100%;
}
</style>