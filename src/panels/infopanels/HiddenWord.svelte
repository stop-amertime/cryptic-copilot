<script lang="ts">
import { slide } from 'svelte/transition';
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

const toggleOpen = (e: MouseEvent) => {
	let elem = e.currentTarget as HTMLDetailsElement;
	e.preventDefault();
	if (elem.classList.contains('open')) {
		elem.classList.remove('open');
	} else {
		elem.classList.add('open');
	}
};

const titleCase = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
</script>

<div class="page">
	{#each hiddenwords as set}
		<div class="set open" on:click={e => toggleOpen(e)}>
			<div class="setlabel">
				<p>
					-{set.start.toLowerCase()}
					{set.middle ? ` / ${titleCase(set.middle)} / ` : ' / '}
					{titleCase(set.end)}-
				</p>
			</div>

			<div class="setcols">
				<div class="a column">
					{#each set.a as word}
						<div class="word">
							{@html `${word.slice(0, word.indexOf(set.start))}<b>${set.start}</b>`}
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
	margin: 20px 10px;
	display: flex;
	flex-direction: column;
	border: 1px solid rgb(231, 231, 231);
	border-radius: 5px;
	position: relative;

	&:after {
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
			transform: rotate('90deg');
		}
	}

	&:not(.open) {
		background-color: rgb(242, 242, 242);
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
