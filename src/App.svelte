<script lang="ts">
	import { fade } from "svelte/transition";
	import { Square } from "svelte-loading-spinners";

	/* ========================================================================== */

	console.time("LOAD");
	const loadComponents = Promise.all([
		import("./StateMediator.svelte").then(s => s.default),
		import("./Grid.svelte").then(s => s.default),
		import("./Panel.svelte").then(s => s.default),
	]);
</script>

<!----------------------------------------------------------------------HTML--->
{#await loadComponents}
	<div class="centre" out:fade>
		<Square size="60" color="#000000" unit="px" duration="2s" />
	</div>
{:then components}
	{@const [stateMediator, grid, panel] = components}
	<svelte:component this={stateMediator} />
	<div id="main">
		<div id="gridArea">
			<svelte:component this={grid} />
		</div>
		<div id="panelArea">
			<svelte:component this={panel} />
		</div>
	</div>
{/await}

<!----------------------------------------------------------------------CSS----->
<style lang="scss" global>
	@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap");
	@import url("https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap");

	* {
		box-sizing: border-box;
		font-family: "Fira Code", monospace;
	}

	.centre {
		position: absolute;
		top: 50%;
		left: 50%;
	}

	@media (min-width: 800px) {
		#main {
			margin: 0px auto;
			position: absolute 0 0;
			width: 100vw;
			height: 100vh;
			padding: 30px 30px;
			max-width: 1800px;
			overflow-y: auto;
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			justify-content: space-evenly;
		}

		#gridArea {
			flex: 1 0 400px;
			max-width: 800px;
			padding-right: 15px;
			padding: 25px;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: stretch;
		}

		#panelArea {
			flex: 2 0 300px;
			max-width: 600px;
			height: 100%;
		}
	}

	@media (max-width: 799px) {
		#main {
			display: flex;
			flex-direction: column;
			width: 100vw;
			height: 100vh;
			align-items: center;
			justify-items: center;
		}

		#gridArea {
			height: 40%;
			display: flex;
			justify-content: center;
			width: 100%;
			flex: 1 0 1fr;
		}

		#panelArea {
			width: 90%;
			flex: 1 1 auto;
			margin: 20px;
			margin-top: 15px;
		}
	}
</style>
