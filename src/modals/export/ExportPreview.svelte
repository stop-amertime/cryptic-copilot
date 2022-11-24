<script lang="ts">
	import { cells, wordSlots } from "../../StateMediator.svelte";
	import * as htmlToImage from "html-to-image";
	import { onMount } from "svelte";
	import { Wave } from "svelte-loading-spinners";
	import { fade } from "svelte/transition";
	import { tweened } from "svelte/motion";
	import { quadInOut } from "svelte/easing";
	export let previewSize = [2000, 1000];

	/* -------------------------------------------------------------------------- */

	let imageURL, imageStyle, wrapperWidth, wrapperHeight;
	let defaultZoom = 1;
	let currentZoom = 1;
	let tweenedZoom = tweened(1, {
		duration: 400,
		easing: quadInOut,
	});
	$: tweenedZoom.set(currentZoom);

	const renderImage = async () =>
		(imageURL = await htmlToImage.toPng(
			document.getElementById("exportPreview")
		));

	const setDefaultZoom = () => {
		let [wSpace, hSpace] = [wrapperWidth, wrapperHeight - 50];
		let targetZoom = Math.min(wSpace / previewSize[0], hSpace / previewSize[1]);
		defaultZoom = Math.floor(targetZoom * 10) / 10;
		currentZoom = defaultZoom;
	};

	onMount(() => {
		renderImage();
		setDefaultZoom();
	});

	$: rowsize = Math.sqrt($cells.length) as number;
</script>

<div class="hiddenPreviewGenerator">
	<div
		id="exportPreview"
		style={`width: ${previewSize[0]}px; height: ${previewSize[1]}px`}
		out:fade={{ duration: 1 }}
	>
		<div id="gridPreview" style="--dimension:{rowsize}">
			{#each $cells as cell}
				<div
					class="cellPreview"
					id={"preview" + cell.id}
					class:valid={cell.isValid}
					class:numbered={cell.isNumbered}
				/>
			{/each}
		</div>

		<div id="cluePreview">
			<div class="column">
				<h3>Across</h3>
				{#each $wordSlots.filter(s => s.orientation == "A") as slot}
					<div class="clue">
						<p class="label">{slot.number}.</p>
						<p class="text" class:emptyClue={!slot.clue}>
							{slot.clue || "No Clue Added"}
						</p>
					</div>
				{/each}
			</div>
			<div class="column">
				<h3>Down</h3>
				{#each $wordSlots.filter(s => s.orientation == "D") as slot}
					<div class="clue">
						<p class="label">{slot.number}.</p>
						<p class="text" class:emptyClue={!slot.clue}>
							{slot.clue || "No Clue Added"}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- 
  DISPLAYED CONTENT 
  -->

<div
	class="wrapper"
	bind:offsetHeight={wrapperHeight}
	bind:offsetWidth={wrapperWidth}
>
	{#if !imageURL}
		<div class="loadingCover" out:fade>
			<div class="loadingAnim">
				<Wave size="60" color="#FFFFFF" unit="px" />
			</div>
		</div>
	{:else}
		<div class="loadedPreview">
			<div class="controls">
				<input
					type="range"
					min="0.1"
					max="3"
					step="0.1"
					bind:value={currentZoom}
					class="zoomSlider"
					style:--label={`"${Math.round(currentZoom * 100) + "%"}"`}
				/>
				<button
					class="resetZoom"
					disabled={currentZoom == defaultZoom}
					on:click={e => {
						currentZoom = defaultZoom;
					}}>⟷</button
				>
			</div>
			<div class="imageWrapper">
				<img
					style={imageStyle}
					src={imageURL}
					style:width={previewSize[0] * $tweenedZoom + "px"}
					style:height={previewSize[1] * $tweenedZoom + "px"}
					transition:fade
					alt="Crossword Preview"
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	/* -------------------------------------------------------------------------- */

	.wrapper {
		@include size(100%);
	}

	.loadingCover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10000000;
		display: flex;
		align-items: center;
		justify-content: center;

		.loadingAnim {
			margin: auto;
		}
	}

	.loadedPreview {
		@include size(100%);
		display: grid;
		grid-template-rows: 60px 1fr;

		.controls {
			@include fillParent();
			padding: 15px;
			display: flex;
			flex-direction: row;
			background-color: rgb(230, 230, 230);
			border-bottom: 1px solid gray;
			align-items: stretch;
			justify-content: space-between;

			.zoomSlider {
				width: 60%;
				position: relative;

				&:after {
					content: var(--label);
					position: absolute;
					right: -60px;
					top: 0px;
					font-size: 20px;
					line-height: 60%;
					text-align: right;
				}
			}

			.resetZoom {
				font-size: 30px;
				padding: 0px;
				margin: 0px;
				line-height: 27px;
			}
		}

		.imageWrapper {
			@include fillParent();
			overflow: auto;

			img {
				object-fit: contain;
				margin: 20px;
			}
		}
	}

	.hiddenPreviewGenerator {
		opacity: 0;
		display: hidden;
		max-width: 0px;
		max-height: 0px;
		overflow: hidden;
	}

	////// EXPORT PREVIEW

	#exportPreview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		background-color: white;

		#gridPreview {
			aspect-ratio: 1;
			margin: 20px;
			display: grid;
			grid-template-columns: repeat(var(--dimension), 1fr);
			grid-template-rows: repeat(var(--dimension), 1fr);
			position: relative;

			.cellPreview {
				overflow: hidden;
				aspect-ratio: 1;
				background-color: black;
				margin-right: -1px;
				margin-bottom: -1px;

				&.valid {
					background-color: white;
					border: 1px solid black;
					position: relative;
					padding: 3px;
					user-select: none;
				}
				&.numbered {
					counter-increment: value;
				}
				&.numbered:nth-of-type(n)::before {
					content: counter(value);
					font-size: calc(5px + 0.3vw);
					line-height: 4px;
					font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
					font-weight: bolder;
					text-align: left;
					position: absolute;
					top: 3px;
					left: 3px;
					color: black;
				}
			}
		}

		#cluePreview {
			flex: 0 0 50%;
			padding: 30px;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			width: 100%;
			height: 100%;
			@include scroll();
			max-width: 100%;

			.column {
				flex: 1 0 auto;
				display: block;
				margin-bottom: 30px;

				h3 {
					font-size: 20pt;
					margin: 0px;
					margin-bottom: 20px;
				}

				.clue {
					width: 100%;
					display: flex;
					flex-direction: row;
					align-items: flex-start;
					justify-content: left;

					.label {
						font-weight: 600;
						flex: 0 0 30px;
						line-height: 0px;
						font-size: 14px;
						padding-top: 5px;
					}

					.text {
						border: none;
						flex: 1 0 auto;
						margin-bottom: 15px;
						padding: 1px;
						overflow: hidden;
						max-width: 50ch;
						&.emptyClue {
							color: orange;
						}
					}
				}
			}
		}
	}

	/* @media (max-width: 799px) {

    } */
</style>
