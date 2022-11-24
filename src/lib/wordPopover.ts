import { createPopper } from '@popperjs/core/dist/umd/popper.js';
import WordPopover from '../lib-components/WordPopover.svelte';

let nonce = 0;
let activeHiders = [];

function hideAll() {
	activeHiders.forEach(fn => fn());
	activeHiders = [];
}

export function popover(node, { component, ...props }) {
	let myId = ++nonce;

	let popperInstance = null;
	let componentInstance = null;
	let renderedComponent = null;
	let isActive = false;
	const id = 'tooltip';

	const toggle = event => {
		event.stopPropagation();
		if (isActive) {
			hideSelf();
		} else {
			hideAll();
			showSelf();
		}
	};

	node.addEventListener('click', toggle);

	const detectClickOutside = event => {
		renderedComponent = document.getElementById(id + myId);
		if (renderedComponent && !renderedComponent.contains(event.target) && isActive) {
			hideSelf();
		}
	};

	const showSelf = () => {
		isActive = true;

		componentInstance = new component({
			target: document.body,
			props,
		});

		renderedComponent = document.body.lastElementChild;
		renderedComponent.id = id + myId;

		popperInstance = createPopper(node, renderedComponent, {
			placement: 'auto',
			modifiers: [
				{
					name: 'offset',
					options: {
						offset: [0, 8],
					},
				},
				{
					name: 'preventOverflow',
					options: {
						rootBoundary: 'document',
						padding: 10,
					},
				},
				{
					name: 'arrow',
					options: {
						padding: 10,
					},
				},
			],
		});

		document.addEventListener('click', detectClickOutside);

		new MutationObserver(function (mutations) {
			if (!document.body.contains(node)) {
				hideSelf();
				this.disconnect();
			}
		}).observe(node.parentElement, { childList: true });

		activeHiders.push(hideSelf);
	};

	const hideSelf = () => {
		isActive = false;
		if (popperInstance) {
			popperInstance.destroy();
			popperInstance = null;
		}
		componentInstance.$destroy();
		document.removeEventListener('click', detectClickOutside);
	};

	return {
		destroy() {
			node.removeEventListener('click', toggle);
			document.removeEventListener('click', detectClickOutside);
		},
	};
}
