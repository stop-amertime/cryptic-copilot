<script lang="ts">
	import ExportPreview from "./ExportPreview.svelte";
	import * as htmlToImage from "html-to-image";
	import { onMount } from "svelte";

	let previewSize = [2000, 1000];
	let previewScale = 1;
	let maxScale = 3;
	let minScale = 0.1;

	const styleOptions = ["compact", "full", "hyperbig"];
	const handOptions = ["left", "right"];

	const paperSizeOptions = new Map([
		["A4", [2000, 1000]],
		["US Letter", [3000, 2000]],
	]);
	let selectedPaperSize = "A4";
	let isLandscape = true;
	$: previewSize = paperSizeOptions.get(selectedPaperSize);
	$: [previewWidth, previewHeight] = [
		previewSize[isLandscape ? 0 : 1],
		previewSize[isLandscape ? 1 : 0],
	];

	const zoom = string => string;
</script>

<div class="page">
	<div class="top">
		<select name="paperSize" bind:value={selectedPaperSize}>
			{#each Array.from(paperSizeOptions.keys()) as size}
				<option>{size}</option>
			{/each}
		</select>
	</div>

	<!-- KEY BY PAPER TYPE  -->

	<div class="previewWrapper">
		<ExportPreview previewSize={[previewWidth, previewHeight]} />
	</div>

	<div class="bottom">Some stuff on the bottom</div>
</div>

<style lang="scss">
	.page {
		width: 95vw;
		height: 95vh;
		display: block;
		padding: 40px 0px;

		.previewWrapper {
			position: relative;
			width: 95%;
			height: 70%;
			margin: auto;
			background-color: rgb(126, 126, 126);
			overflow: hidden;
			border: 1px solid black;
			border-radius: 3px;
		}
	}
</style>
