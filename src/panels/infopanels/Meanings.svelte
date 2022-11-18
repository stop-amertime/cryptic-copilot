<script lang="ts">
import { slide } from 'svelte/transition';
export let data: IThesaurusEntry;
let abbreviationList = data?.abbreviationFor?.split(',') || null;

const rowSizer = node => {
	let vertMargin = node.clientHeight * 0.5 + 'px';
	node.style.marginTop = node.style.marginBottom = vertMargin;
};

let closedGroups = [];
const toggleOpen = (index: number) => {
	closedGroups = closedGroups.includes(index)
		? closedGroups.filter(x => x != index)
		: [...closedGroups, index];
};
</script>

<template lang="pug">
.scrollwrapper
    +each('data?.partsOfSpeech || [] as part')
        +each('part?.senses|| [] as sense, index')
            .partOfSpeech("class:open={!closedGroups.includes(index)} on:click={e => toggleOpen(index)}")
                .label
                    .partName <b>{part.partOfSpeech}</b>
                    .definition {sense.definition}
                +if("!closedGroups.includes(index)")
                    .synonyms(transition:slide)
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

// Spinning Arrow

.label:before {
	transition: 0.3s ease-in-out;
	content: '▶';
	position: absolute;
	top: 25px;
	left: 10px;
	color: darkgray;
	font-size: 10px;
}

.open > .label:before {
	transform: rotate(90deg);
}

// ---

.partOfSpeech {
	position: relative;
	font-size: 12px;
	display: block;
	padding: 15px;
	margin-bottom: 40px;
	margin-right: 10px;
	background-color: none;
	transition: height 0.2s ease;
	transition: max-height 0.2s ease;
	height: min-content;
	user-select: none;
	border: 1px solid lightgray;
	border-radius: 5px;

	&:hover {
		background-color: #fefefe;
		cursor: pointer;
	}

	.label {
		position: sticky;
		top: 0;
		background-color: white;
		width: 100%;
		flex-wrap: nowrap;
		font-size: 16px;
		padding: 5px;
		margin-bottom: 10px;
		padding-left: 20px;
		text-align: left;
		line-height: 20px;

		.partName,
		.definition {
			flex: 0 1 auto;
			padding: 5px;
		}
	}
	.synonyms {
		overflow: hidden;
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
