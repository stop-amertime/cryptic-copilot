<script lang="ts">
	import { onMount } from "svelte";
	import Square from "svelte-loading-spinners/dist/ts/Square.svelte";
	import { fade } from "svelte/transition";
	let isLoading = true;
	let loadedComponent;
	$: timeLoading(isLoading);

	const timeLoading = (bool: boolean) => {
		bool ? console.time("LOAD: ") : console.timeEnd("LOAD: ");
	};

	onMount(() =>
		import("./StateMediator.svelte").then(c => (loadedComponent = c.default))
	);
</script>

{#if isLoading}
	<div class="loading-overlay" transition:fade>
		<Square color="black" duration="2s" />
	</div>
{/if}

<svelte:component this={loadedComponent} bind:isLoading />

<style lang="scss">
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
