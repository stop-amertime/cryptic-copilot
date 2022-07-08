<script lang="ts">
import { slide } from 'svelte/transition';
import VirtualList from '@sveltejs/svelte-virtual-list';
import { createEventDispatcher, onMount } from 'svelte';
/* -------------------------------------------------------------------- Props */
export let listProps;
export let listHeights: { head: number; inner: number };
export let list = null as IDevice[];
export let definition = null as IThesaurusEntry;
export let isOpen;
const dispatch = createEventDispatcher();
let isAnimated = false;
onMount(() => {
	isAnimated = true;
});
const { name, subComponent, index } = listProps;
$: numberOfEntries = list ? list.length : definition?.numberOfSenses ?? 0;
$: if (!numberOfEntries) isOpen = false;

const clicked = event => {
	dispatch('opened', index);
};

const hasTopBorder = index != 0;
const hasBottomBorder = index != 2;
</script>

<!----------------------------------------------------------------------HTML--->

<details
	bind:open={isOpen}
	class="deviceDropdown"
	class:animate={isAnimated}
	class:disabled={numberOfEntries == 0}
	class:hasTopBorder
	class:hasBottomBorder
	style:--height={listHeights.inner + 'px'}
	on:click={clicked}
	on:introend={() => (isAnimated = true)}
>
	<summary style:height={listHeights.head + 'px'} class:animate={isAnimated}>
		<span>{name} ({numberOfEntries})</span></summary
	>

	<div
		class="listContainer"
		style:--height={listHeights.inner + 'px'}
		class:animate={isAnimated}
	>
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
	height: 30px;
	line-height: 10px;
	transition: height 0.7s ease-in-out;

	&[open] {
		border-radius: 2px;
		height: calc(30px + var(--height));
		transition: height 0.7s ease-in-out;

		&.hasTopBorder {
			border-top-width: 1px;
		}
		&.hasBottomBorder {
			border-bottom-width: 1px;
		}
		border-width: 0px;
		border-style: solid;
		border-color: black;
	}

	&.disabled {
		opacity: 0.3;
		pointer-events: none;
	}
}

.animate {
	transition: all 400ms ease;
}

summary {
	width: 100%;
	height: 30px;
	padding: 10px;
	cursor: pointer;
	user-select: none;
}

.listContainer {
	width: 100%;
	padding: 5px;
	overflow-y: hidden;
	height: var(--height);
}
</style>
