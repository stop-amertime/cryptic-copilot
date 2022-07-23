<script lang="ts">
import { createEventDispatcher, onDestroy, setContext } from 'svelte';

const dispatch = createEventDispatcher();
const close = () => dispatch('close');

let modal: HTMLElement;

const handle_keydown = e => {
	if (e.key === 'Escape') {
		close();
		return;
	}

	if (e.key === 'Tab') {
		// trap focus
		const nodes = modal.querySelectorAll('*');
		const tabbable = Array.from(nodes).filter(
			(n: HTMLElement) => n.tabIndex >= 0
		) as HTMLElement[];

		let index = tabbable.indexOf(document.activeElement as HTMLElement);
		if (index === -1 && e.shiftKey) index = 0;

		index += tabbable.length + (e.shiftKey ? -1 : 1);
		index %= tabbable.length;

		tabbable[index].focus();
		e.preventDefault();
	}
};

const previously_focused: HTMLElement =
	typeof document !== 'undefined' && (document.activeElement as HTMLElement);

if (previously_focused) {
	onDestroy(() => {
		previously_focused.focus();
	});
}
</script>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" on:click={close} />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
	<!-- svelte-ignore a11y-autofocus -->
	<button class="closebutton" autofocus on:click={close}>x</button>
	<slot />
</div>

<style lang="scss">
.modal-background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.3);
}

.modal {
	position: absolute;
	left: 50%;
	top: 50%;
	// max-width: calc(100vw - 4em);
	// max-height: calc(100vh - 4em);
	// overflow: auto;
	transform: translate(-50%, -50%);
	padding: 1em;
	border-radius: 0.2em;
	background: white;
}

.closebutton {
	position: fixed;
	top: 10px;
	right: 10px;
	background-color: white;
	border: none;
	color: #000;
	font-size: 20px;
	cursor: pointer;
	width: 40px;
	height: 40px;
	line-height: 0px;
	transition: all 0.2s ease;
	border-radius: 50%;
	text-align: center;
	text-justify: center;

	&:hover {
		opacity: 0.6;
		background-color: rgba(128, 128, 128, 0.181);
	}
}
</style>
