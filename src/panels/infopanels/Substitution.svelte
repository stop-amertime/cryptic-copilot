<script lang="ts">
import { fade, slide } from 'svelte/transition';
import WordPopover from '../../lib-sv/WordPopover.svelte';
import { popover } from '../../lib/wordPopover';
import { scoreToColour } from '../../lib/DictionaryEngine';
import { quadInOut } from 'svelte/easing';
import { activeWord } from '../../StateMediator.svelte';
import { writable } from 'svelte/store';
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
const toggleOpen = (e: MouseEvent, index: number) => {
	let elem = e.currentTarget as HTMLElement;
	e.preventDefault();
	if (elem.classList.contains('open')) {
		elem.classList.remove('open');
	} else {
		elem.classList.add('open');
	}
	if ($closedGroups.includes(index)) {
		$closedGroups = $closedGroups.filter(x => x != index);
	} else {
		$closedGroups = [...$closedGroups, index];
	}

	console.log(closedGroups);
};

let closedGroups = writable([]);

function growAnim(node) {
	let maxheight = node.scrollHeight;
	let duration = 1000;

	return {
		duration,
		easing: quadInOut,
		css: t => `max-height: ${maxheight * t}; `,
	};
}
</script>

{#if $activeWord}
	<div class="page">
		{#each groups as group, index}
			{@const deletedWord = group[0].deleted.word}
			{@const [beforeDeleted, afterDeleted] = $activeWord.split(deletedWord)}

			<div class="group open" on:click={e => toggleOpen(e, index)}>
				<div class="label">
					<p>
						{@html `${beforeDeleted}<u>${deletedWord}</u>${afterDeleted}`}
					</p>
				</div>
				{#if !$closedGroups.includes(index)}
					<div class="entries" transition:slide>
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
										use:popover={{
											component: WordPopover,
											word: replacedBy.word,
										}}
										style:background-color={scoreToColour(replacedBy.score)}
									>
										{replacedBy.word}
									</div>
								{:else}
									<p>🗑</p>
								{/if}
								<p>⇒</p>
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
				{/if}
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
		padding: 10px;
		display: flex;
		flex-direction: column;
		border: 1px solid rgb(231, 231, 231);
		border-radius: 5px;
		position: relative;

		&:after {
			transition: 0.3s ease-in-out;
			content: '▶';
			position: absolute;
			top: 20px;
			left: 20px;
			color: darkgray;
			font-size: 15px;
			z-index: 1000;
		}

		&.open {
			&:after {
				transform: rotate(90deg);
			}
		}

		&:not(.open) {
			background-color: rgb(226, 226, 226);
			// & > .entries {
			// 	max-height: 0px;
			// 	opacity: 0;
			// }
		}

		&:hover {
			background-color: rgb(255, 253, 253);
		}

		.label {
			width: 100%;
			height: 50px;
			border-radius: 5px;
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;

			p {
				font-size: 18px;
				padding: 5px;
				margin: 5px;
				width: 100%;
				text-align: center;
				user-select: none;
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
			padding: 5px 10px;

			.entry {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				align-items: stretch;
				justify-content: center;

				p {
					flex: 0 0 40px;
					height: 40px;
					font-size: 20px;
					line-height: 45px;
					text-align: center;
					margin: 0px;
					padding: 0px;
					user-select: none;
				}

				p:last-of-type {
					flex: 1 0 auto;
				}

				.word {
					flex: 0 1 auto;
					padding: 10px 5px;
					display: inline-block;
					position: relative;
					height: 40px;
					font-size: 16px;
					font-family: 'Courier Prime', Courier, monospace;
					margin: 4px 2px;
					border-radius: 2px;
					border: 1px solid gray;
					cursor: pointer;
					overflow: visible;
					text-transform: lowercase;
					text-align: center;
					text-overflow: ellipsis;

					&:hover {
						filter: contrast(1.5);
						opacity: 0.8;
					}
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
