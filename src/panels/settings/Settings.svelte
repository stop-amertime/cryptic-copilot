<script lang="ts">
	import GridModal from "../../modals/grid/GridModal.svelte";
	import DictionaryModal from "../../modals/dictionary/DictionaryModal.svelte";
	import { Save, Load } from "../../lib/FileManager";
	import { changeLayout, clearGrid } from "../../StateMediator.svelte";
	import Modal from "../../modals/Modal.svelte";
	import CodeRunner from "./CodeRunner.svelte";
	import ExportModal from "../../modals/export/ExportModal.svelte";

	const save = () => Save.stateToFile();
	const resetGrid = (event: MouseEvent) => clearGrid();
	const changeGrid = (event: MouseEvent) => {
		let node = event.target as HTMLElement;
		let layout = Load.defaultLayouts?.[node.id];
		if (!layout) {
			console.error(`Layout ${node.id} not found`);
			return;
		}
		changeLayout(layout);
	};

	let ModalComponent = null;
	let ModalProps = {};
</script>

<!----------------------------------------------------------------------HTML--->
<div id="page">
	<div class="row">
		<span>▩ Grid</span>
		<div class="buttonrow">
			<button on:click={e => (ModalComponent = GridModal)}>▦ Change</button>
			<button on:click={resetGrid}>🗑 Clear</button>
		</div>
	</div>

	<div class="row">
		<span>🕮 Dictionary</span>
		<div class="buttonrow">
			<button on:click={e => (ModalComponent = DictionaryModal)}
				>＋ Upload</button
			>
			<button on:click={e => (ModalComponent = DictionaryModal)}>✎ Edit</button>
		</div>
	</div>
	<div class="row">
		<span>🗄 Files</span>
		<div class="buttonrow">
			<button>🖫 Save As</button>
			<button on:click={e => (ModalComponent = DictionaryModal)}>🗁 Load</button>
		</div>
		<label>
			<input type="checkbox" disabled />
			<p>Autosave to File on Edit</p>
		</label>
	</div>
	<div class="row">
		<span>🕮 EXPORT!</span>
		<div class="buttonrow">
			<button on:click={e => (ModalComponent = ExportModal)}>✎ Show!</button>
		</div>
	</div>
	<CodeRunner />
</div>

{#if ModalComponent}
	<Modal on:close={e => (ModalComponent = null)}>
		<svelte:component this={ModalComponent} />
	</Modal>
{/if}

<style lang="scss">
	#page {
		@include scroll();
		width: 100%;
		max-width: 100%;
		height: 100%;
		@include flex-col(stretch, space-around);
		grid-gap: 15px;
		padding: 20px;
	}

	.row {
		width: 100%;
		display: block;
		flex: 0 0 auto;

		span {
			width: 100%;
			font-size: 1.5em;
			font-weight: bold;
			text-align: center;
			height: 60px;
			line-height: 60px;
		}

		.buttonrow {
			display: flex;
			button {
				flex: 1 0 auto;
				font-size: 1.2em;
				padding: 10px;
				border: 1px solid #000;
				border-radius: 5px;
				margin: 10px;
				background-color: #fff;
				color: #000;
				cursor: pointer;

				&:hover {
					background-color: rgb(231, 231, 231);
					color: rgb(111, 109, 109);
				}
				&:active {
					background-color: rgb(194, 192, 192);
					color: #000;
				}
			}
		}
	}

	label {
		display: inline-flex;
		line-height: 0px;
		& > * {
			margin-right: 20px;
		}

		input:disabled + p {
			color: #ccc;
		}
	}
</style>
