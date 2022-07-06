<script lang="ts">
export let word = 'NO WORD ENTERED';
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
</script>

<div class="popover">
	Your Word Was: {word}

	<div id="arrow" data-popper-arrow />
</div>

<style lang="scss">
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

$popovercolor: white;
.popover {
	box-shadow: 10px 0px 15px rgba(0, 0, 0, 0.435);
	background-color: $popovercolor;
	width: 300px;
	height: 300px;
	border-radius: 3px;
	padding: 10px;
}

#arrow::before {
	background-color: $popovercolor;
	content: '';
	transform: rotate(45deg);
}

#arrow,
#arrow::before {
	position: absolute;
	width: 8px;
	height: 8px;
	z-index: -1;
}

:global(.popover[data-popper-placement^='bottom'] > #arrow) {
	top: -4px;
}

:global(.popover[data-popper-placement^='top'] > #arrow) {
	bottom: -4px;
}

:global(.popover[data-popper-placement^='left'] > #arrow) {
	right: -4px;
}

:global(.popover[data-popper-placement^='right'] > #arrow) {
	left: -4px;
}
</style>
