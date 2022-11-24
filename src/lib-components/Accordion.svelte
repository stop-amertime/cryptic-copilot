<script lang="ts">
    import { slide } from "svelte/transition";

export let open = true;
const toggleOpen = () => open = !open;
</script>

<div
    class="accordion"
    class:open
>
    <div class="header"
    on:click={e => toggleOpen()}>
        <slot name="header"/>
    </div>
    {#if open}
        <div class="inner" transition:slide>
            <slot name="inner"/>
        </div>
    {/if}
</div>

<style lang="scss">

    .header, .inner {
        border: 1px solid rgb(231, 231, 231);
        border-radius: 3px;
    }

    .accordion {
    display: block;
    position: relative;
    margin-bottom: 30px;
    background-color: white;

    &.open {

        .header{
            border-bottom: none;
        }

        .header:after {
            transform: rotate(90deg);
        }

    }

    .header {
        display: block;
        z-index: 10;
        position: sticky;
        top: 0px;
        background-color: white;
        transition: all 0.2 ease-out;

        &:hover {
            background-color: rgb(243, 243, 243);
        }

        &:after {
            transition: 0.3s ease-in-out;
            content: '▶';
            position: absolute;
            left: 10px;
            top:50%;
            color: darkgray;
            font-size: 15px;
            line-height: 0px;
        }
    }

    .inner {
        padding: 10px;
        border-top: none;
    }

}
</style>