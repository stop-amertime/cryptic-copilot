<script lang="ts">
	import PossibleWords from "./panels/PossibleWords.svelte";
	import { activeWord } from "./StateMediator.svelte";
	import { writable } from "svelte/store";
	import { fly, slide } from "svelte/transition";
	import { slideReplaceIn, slideReplaceOut } from "./lib/utils";
	import { quadIn, quadInOut, quadOut } from "svelte/easing";
	import { onMount } from "svelte";
	/* -------------------------------------------------------------------------- */

	/* ----------------------------------------------       Import Secondary Tabs */

	// Defer loading of secondary tabs.
	let Cryptic, Clues, Settings;
	onMount(async () => {
		[Cryptic, Clues, Settings] = await Promise.all([
			import("./panels/Cryptic.svelte").then(p => p.default),
			import("./panels/Clues.svelte").then(p => p.default),
			import("./panels/Settings.svelte").then(p => p.default),
		]);
	});

	/* ............................................. Display Correct Page For Tab */

	let tabs = writable([
		{ label: "🙾 Words", checked: true, disabled: false },
		{ label: "🗲 Cryptic", checked: false, disabled: true },
		{ label: "? Clues", checked: false, disabled: false },
		{ label: "⛭ Settings", checked: false, disabled: false },
	]);

	$: displayPage = [PossibleWords, Cryptic, Clues, Settings];
	let currentTab = 0;
	let previousTab = $tabs.length - 1;
	let pageChangeDirection: "up" | "down" | "left" | "right" = "right";

	$: changePage(currentTab); //currentTab bound to selected Radio.

	function changePage(tabNumber: number) {
		pageChangeDirection = tabNumber < previousTab ? "left" : "right";
		currentTab = tabNumber;
		previousTab = tabNumber;
	}

	/* ............................................ Toggle Tab2 If No Active Word */

	$: if (!$activeWord) {
		if (currentTab == 1) {
			currentTab = 0;
		}
		$tabs[1].disabled = true;
	} else {
		$tabs[1].disabled = false;
	}
	/* -------------------------------------------------------------------------- */
</script>

<div id="panelWrapper">
	<div id="panelTabs">
		{#each $tabs as tab, index}
			<button
				on:click={() => (currentTab = index)}
				class:selectedTab={currentTab == index}
				class:disabled={tab.disabled}
				disabled={tab.disabled}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div id="panelPageBorder">
		{#key currentTab}
			<div
				id="panelPage"
				in:slideReplaceIn={{
					direction: pageChangeDirection,
					easing: quadInOut,
				}}
				out:slideReplaceOut={{
					direction: pageChangeDirection,
					easing: quadInOut,
				}}
			>
				<svelte:component this={displayPage[currentTab]} />
			</div>
		{/key}
	</div>
</div>

<style lang="scss">
	/* -------------------------------------------------------------------------- */

	:global(#panelWrapper *) {
		font-family: "Fira Code", "Courier New", Courier, monospace;
	}

	#panelWrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Static border, doesn't move while internal panel animates. */
	#panelPageBorder {
		width: 100%;
		flex: 1 0 300px;
		border-right: 1px solid black;
		border-left: 1px solid black;
		border-bottom: 1px solid black;
		border-radius: 0px 0px 2px 2px;
		overflow: hidden;
		@include staticTransitionParent();
	}

	:global(#panelPage) {
		padding: 0px;
		width: 100%;
		height: 100%;
		overflow: hidden;
		@include staticTransitionWrapper();
		@include staticTransitionChild();
	}

	#panelTabs {
		width: 100%;
		flex: 0 0 30px;
		max-width: calc(100% - 1px);

		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;

		button {
			flex: 1 0 auto;
			margin: 0;
			padding: 10px 10px;
			border-radius: 2px 2px 0 0;
			border-width: 1px 1px 0px 1px;
			margin-right: -1px;
			margin-left: 0px;
			border-style: solid;
			border-color: rgb(213, 213, 213);
			border-bottom: 1px solid black;
			font-size: 15px;
			cursor: pointer;
			-webkit-transition: all 0.2s ease-in-out;
			transition: all 0.2s ease-in-out;
			text-align: center;
			background-color: whitesmoke;
			color: rgba(79, 79, 79, 0.994);

			&.selectedTab {
				z-index: 0;
				margin-top: 0px;
				padding-top: 5px;
				background: white;
				color: black;
				border-color: black black white black;
				cursor: default;
			}
			&:not(.disabled):not(.selectedTab):hover {
				background: rgba(242, 242, 242, 0.64);
				color: rgb(113, 113, 113);
			}

			&.disabled {
				background-color: rgb(233, 233, 233);
				color: rgba(153, 153, 153, 0.538);
				border-bottom: 1px solid black;
				cursor: default;
			}
		}
	}
</style>
