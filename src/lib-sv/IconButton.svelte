<script lang="ts">
/*-------------------------------------*/
import {createEventDispatcher} from 'svelte'
/*-------------------------------------*/


export let disabled: boolean; 
export let url: string;
export let id: string;

let dispatch = createEventDispatcher();

</script>


<button
id={id}
class="smallbutton"
disabled="{disabled}"
on:click={() => {dispatch('clicked')}}>
    <img src={url} alt="{id}"/>
</button>




<style>

.smallbutton {
    cursor: pointer !important;
    object-fit:contain;
    border-radius: 3px;
    background-color: rgb(255, 255, 255);
    box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.205); 
    border: none;

}

.smallbutton:hover {
    opacity: 0.7;
}

.smallbutton:disabled {
    background-color: darkgray;
    opacity: 0.4;
    cursor: not-allowed !important;
}

.smallbutton > img{
    width: 100%;
    height: 100%;
    cursor: pointer !important;
}

.smallbutton:disabled > img{
    cursor: not-allowed !important;
}
</style>