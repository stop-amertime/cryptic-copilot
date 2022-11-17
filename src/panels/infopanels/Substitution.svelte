<script lang="ts">
import WordPopover from '../../lib-sv/WordPopover.svelte';
import { popover } from '../../lib/wordPopover';
import { scoreToColour } from '../../lib/DictionaryEngine';
import { quadInOut } from 'svelte/easing';
import { activeWord } from '../../StateMediator.svelte';
export let list: ISubstitutionGrouped;

// Convert map to group(array) of Substitutions.
// Groups keyed by the word that was initially deleted.
let groups: ISubstitution[][] = [];
for (let [deleted, pairs] of list) {
	let group: ISubstitution[] = [];
	for (let pair of pairs) {
		group.push({ deleted, ...pair });
	}
	groups.push(group);
}

// Toggle collapsible groups.
const toggleOpen = (e: MouseEvent) => {
	let child = e.currentTarget as HTMLElement;
	let elem = child.parentElement;
	e.preventDefault();
	if (elem.classList.contains('open')) {
		elem.classList.remove('open');
	} else {
		elem.classList.add('open');
	}
};

function growAnim(node, { duration = 1000 }) {
	let maxheight = node.scrollHeight;

	return {
		duration,
		easing: quadInOut,
		css: t => `max-height: ${maxheight * t}`,
	};
}
</script>

{#if $activeWord}
	<div class="page">
		{#each groups as group}
			{@const deletedWord = group[0].deleted.word}
			{@const [beforeDeleted, afterDeleted] = $activeWord.split(deletedWord)}

			<div class="group open">
				<div class="label" on:click={e => toggleOpen(e)}>
					<p>
						{@html `${beforeDeleted}<b>${deletedWord}</b>${afterDeleted}`}
					</p>
				</div>

				<div class="entries">
					{#each group as entry}
						{@const { deleted, replacedBy, finalWord } = entry}
						<div class="entry">
							<div
								class="word deleted"
								class:abbr={deleted.abbreviationFor}
								use:popover={{ component: WordPopover, word: deleted.word }}
								style:background-color={scoreToColour(deleted.score)}
							>
								{deleted.word}
							</div>

							{#if replacedBy}
								<p>⇄</p>
								<div
									class="word replacedBy"
									class:abbr={replacedBy.abbreviationFor}
									use:popover={{ component: WordPopover, word: replacedBy.word }}
									style:background-color={scoreToColour(replacedBy.score)}
								>
									{replacedBy.word}
								</div>
								<p>⇒</p>
							{:else}
								<p>⥇</p>
							{/if}
							<div
								class="word final"
								use:popover={{ component: WordPopover, word: finalWord.word }}
								style:background-color={scoreToColour(finalWord.score)}
							>
								{finalWord.word}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
.page {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;

	.group {
		margin: 20px 10px;
		display: flex;
		flex-direction: column;
		border: 1px solid rgb(231, 231, 231);
		border-radius: 5px;
		position: relative;

		&:after {
			transition: 0.3s ease-in-out;
			content: '>';
			position: absolute;
			top: 10px;
			left: 10px;
			color: black;
			font-size: 20px;
			z-index: 1000;
		}

		&.open {
			&:after {
				transform: rotate(90deg);
			}
		}

		&:not(.open) {
			background-color: rgb(242, 242, 242);
			& > .entries {
				max-height: 0px;
				opacity: 0;
			}
		}

		.label {
			width: 100%;
			border-radius: 5px;
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;

			&:hover {
				background-color: rgb(255, 253, 253);
			}

			p {
				font-size: 20px;
				width: 100%;
				text-align: center;
			}
		}

		.entries {
			transition: all 0.5s ease-out;
			max-height: 1500px;
			opacity: 1;
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			position: relative;

			.entry {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				align-items: stretch;
				justify-content: flex-start;

				p {
					flex: 1 0 auto;
					font-size: 20px;
				}

				.word {
					flex: 1 0 auto;
					display: inline-block;
					position: relative;
					font-size: 16px;
					font-family: 'Courier Prime', Courier, monospace;
					margin: 8px 2px;
					border-radius: 2px;
					border: 1px solid gray;
					cursor: pointer;
					overflow: visible;
					text-transform: lowercase;
				}

				.abbr {
					border: 1px solid black;
					text-transform: uppercase;
				}
			}
		}
	}
}
</style>
