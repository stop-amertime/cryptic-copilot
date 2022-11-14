<script lang="ts">
import { slide } from 'svelte/transition';
export let meanings: IThesaurusEntry;
let abbreviationList = meanings?.abbreviationFor?.split(',') || null;

const rowSizer = node => {
	let vertMargin = node.clientHeight * 0.1 + 'px';
	node.style.marginTop = node.style.marginBottom = vertMargin;
};
</script>

<template lang="pug">
.scrollwrapper
    +each('meanings?.partsOfSpeech || [] as part')
        +each('part?.senses|| [] as sense')
            details.partOfSpeech(open)
                summary 
                    .partName <b>{part.partOfSpeech}</b>
                    .definition <i>{sense.definition}</i>
                +each('sense?.synonyms || [] as synonym')
                    .synonymsrow(use:rowSizer)
                        .syn.main {synonym.mainWord}
                        +each('synonym?.relatedWords || [] as related')
                            .syn.related {related}
    +if('abbreviationList')
        p.abbrHeader Cryptic Abbreviation For: 
        .abbrWrapper
            +each('abbreviationList as abbr')
                .abbrDef {abbr}

</template>

<style lang="scss" global>
//- * {
//- 	outline: 1px solid blue;
//- }
$indent: 15px;

.scrollwrapper {
	position: relative;
	@include size(100%, 100%);
	overflow-y: auto;
	display: block;
	align-items: center;
}

details.partOfSpeech {
	width: 100%;
	font-size: 12px;
	display: block;
	padding: 0px;
	padding-left: $indent;
	margin: 10px 0px;
	background-color: white !important;
	transition: height 0.2s ease;
	transition: max-height 0.2s ease;
	height: min-content;

	&[open] {
		height: max-content;
		padding-bottom: 20px;
	}

	summary {
		display: inline-flex;
		flex-wrap: nowrap;
		font-size: 14px;
		padding: 5px 5px 5px 0px;
		margin-bottom: 10px;
		text-align: left;
		height: max-content;
		max-width: min(80ch, 90%);
		line-height: 14px;

		.partName,
		.definition {
			flex: 0 1 auto;
			padding: 5px;
		}

		&:hover {
			background-color: #f0f0f0;
		}
	}

	.synonymsrow {
		width: 100%;
		display: inline-flex;
		flex-wrap: wrap;
		margin-top: 5px;
		padding-left: $indent;
		max-width: min(80ch, 90%);
	}

	.syn {
		padding: 5px 7px;
		border-radius: 3px;
		text-align: center;
		margin: 3px;
		border: 1px solid grey;

		&.main {
			flex: 4 1 auto;
			background-color: rgb(229, 229, 229);
			color: black;
		}

		&.related {
			flex: 2 1 auto;
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
