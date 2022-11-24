<script lang="ts">
	import { slide } from "svelte/transition";
	export let data: IThesaurusEntry;
	let abbreviationList = data?.abbreviationFor?.split(",") || null;
	import Accordion from "../../lib-components/Accordion.svelte";

	const rowSizer = node => {
		let vertMargin = node.clientHeight * 0.5 + "px";
		node.style.marginTop = node.style.marginBottom = vertMargin;
	};
</script>

<template lang="pug">
.scrollwrapper
	+each('data?.partsOfSpeech || [] as part')
		+each('part?.senses|| [] as sense, index')
			Accordion
				.label("slot=header")
					.partName <b>{part.partOfSpeech}</b>
					.definition {sense.definition}
				.synonyms("slot=inner")
					+each('sense?.synonyms || [] as synonym')
						.synonymsrow()
							.syn.main {synonym.mainWord}
							+each('synonym?.relatedWords || [] as related')
								.syn.related {related}
	+if('abbreviationList')
		p.abbrHeader Cryptic Abbreviation For: 
		.abbrWrapper
			+each('abbreviationList as abbr')
				.abbrDef {abbr}

</template>

<style lang="scss">
	$indent: 15px;

	.scrollwrapper {
		position: relative;
		@include size(100%, 100%);
		overflow-y: auto;
		display: block;
		align-items: center;
	}

	.label {
		width: 100%;
		display: flex;
		flex-wrap: nowrap;
		padding: 5px 20px;
		padding-top: 6px;
		font-size: 16px;
		text-align: left;
		line-height: 20px;
		align-items: center;

		.partName,
		.definition {
			flex: 0 1 auto;
			padding: 0px 10px;
		}
	}

	.synonyms {
		.synonymsrow {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			margin-top: 20px;
			border: 1px solid lightgray;
			border-radius: 5px;
			overflow: hidden;
		}

		.syn {
			font-size: 13px;
			padding: 7px;
			text-align: center;
			border: 1px solid lightgray;
			margin-top: -1px;
			margin-left: -1px;

			&.main {
				flex: 1 1 100px;
				font-style: italic;
				text-align: center;
				background-color: rgb(248, 248, 248);
			}

			&.related {
				flex: 1 1 100px;
			}
		}
	}

	.abbrHeader {
		font-size: 16px;
		font-style: italic;
		margin-top: 10px;
		margin-bottom: 10px;
		text-align: center;
	}

	.abbrWrapper {
		display: flex;
		flex-wrap: wrap;
		margin-top: 10px;
		margin-bottom: 10px;
		justify-content: center;

		.abbrDef {
			font-size: 12px;
			outline: 1px solid grey;
			padding: 5px;
			margin: 3px;
			border-radius: 5px;
		}
	}
</style>
