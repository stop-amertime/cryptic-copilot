<script lang="ts">
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

let x = hiddenwords;
</script>

<div class="page">
	{#each hiddenwords as set}
		<div class="set">
			<div class="setlabel">
				...{set.start}
				{set.middle ? ` + ${set.middle} + ` : ' + '}
				{set.end}...
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
	margin: 20px 0px;
	display: flex;
	flex-direction: column;

	.setlabel {
		width: 100%;
		border: 1px solid grey;
		border-radius: 5px;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		text-align: center;
	}

	.setcols {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;

		.column {
			padding: 5px;
			flex: 1 0 auto;
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: center;
			justify-content: center;
			display: block;

			&.a {
				text-align: right;
				border-right: 1px solid rgb(202, 202, 202);
			}

			&.m {
				text-align: center;
				flex: 0 0 auto;
				border-right: 1px solid rgb(202, 202, 202);
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
