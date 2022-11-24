<script lang="ts">
import { slide } from 'svelte/transition';
import { isFunctionLike } from 'typescript';
export let hiddenwords: IHiddenWord[] = [
	{
		start: 'CDC',
		middle: 'ABC',
		end: 'PP',
		a: ['FILMCDC', 'TVCDC', 'RADARCDC', 'XYZCDC', 'XYSYDSYCDC'],
		b: ['PPFILMPP', 'PPTVPP', 'PPRADARPP', 'PPXYZ', 'PPXYSYDSY', 'PP'],
	},

	{
		start: 'AB',
		end: 'XY',
		a: [
			'FILMAB',
			'TVAB',
			'RADARAB',
			'RADARAB',
			'RADARAB',
			'RADARAB',
			'RADARAB',
			'RADARAB',
			'RADARRRAB',
			'XYZAB',
			'XYSYDSYAB',
		],
		b: ['XYFILM', 'XYTV'],
	},
];

// Toggle collapsible groups.
const toggleOpen = (e: MouseEvent, index: number) => {
	closedGroups = closedGroups.includes(index)
		? (closedGroups = closedGroups.filter(x => x != index))
		: [...closedGroups, index];
};

let closedGroups = [];

const titleCase = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
</script>

<div class="page">
	{#each hiddenwords as set, index}
		<div
			class="set"
			class:open={!closedGroups.includes(index)}
			on:click={e => toggleOpen(e, index)}
		>
			<div class="setlabel">
				<p>
					__{set.start.toLowerCase()}
					{set.middle ? `  ${titleCase(set.middle)}  ` : '  '}
					{titleCase(set.end)}__
				</p>
			</div>
			{#if !closedGroups.includes(index)}
				<div class="setcols" transition:slide>
					<div class="a column">
						{#each set.a as word}
							<div class="word">
								{@html `${word.slice(0, word.lastIndexOf(set.start))}<b>${
									set.start
								}</b>`}
							</div>
						{/each}
					</div>
					{#if set.middle}
						<div class="m column">
							<div class="word">{set.middle}</div>
						</div>
					{/if}

					<div class="b column">
						{#each set.b as word}
							<div class="word">
								{@html `<b>${set.end}</b>${word.slice(set.end.length)}`}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
.page {
	width: 100%;
	height: 100%;
	overflow-x: hidden;
}

.set {
	margin: 0px 10px;
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	border: 1px solid rgb(231, 231, 231);
	background-color: white;
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
	}

	&.open {
		&:after {
			transform: rotate(90deg);
		}
	}

	&:not(.open) {
		& > .setcols {
			max-height: 0px;
			opacity: 0;
		}
	}

	&:hover {
		background-color: rgb(255, 253, 253);
	}

	.setlabel {
		width: 100%;
		border-radius: 5px;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;

		p {
			font-size: 20px;
			width: 100%;
			text-align: center;
		}
	}

	.setcols {
		transition: all 0.5s ease-out;
		max-height: 1500px;
		opacity: 1;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		position: relative;

		.column {
			position: sticky;
			top: 0px;
			padding: 5px;
			flex: 1 0 auto;
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: center;
			justify-content: center;
			display: block;
			height: max-content;

			&.a {
				text-align: right;
				border-right: 1px solid rgb(202, 202, 202);
				margin-right: -1px;
			}

			&.m {
				text-align: center;
				flex: 0 0 auto;
				border-right: 1px solid rgb(202, 202, 202);
				border-left: 1px solid rgb(202, 202, 202);
			}

			&.b {
				border-left: 1px solid rgb(202, 202, 202);
			}

			.word {
				white-space: initial;
				flex: 0 0 auto;
				margin: 5px;
			}
		}
	}
}
</style>
