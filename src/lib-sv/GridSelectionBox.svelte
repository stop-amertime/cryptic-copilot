<script lang="ts">

  // Box that  moves whwn the user selects a slot. ./o 
  import { tweened } from "svelte/motion";
  import { sineInOut } from "svelte/easing";
  import { activeSlotBoundingBox } from "../StateMediator.svelte";

  let animParams = { duration: 400, easing: sineInOut };
  let gap = 1;
  let top = tweened(0, animParams);
  let left = tweened(0, animParams);
  let width = tweened(0, animParams);
  let height = tweened(0, animParams);
  let rotation = tweened(0, animParams);
  let opacity = tweened(1, { ...animParams, duration: 200 });

  activeSlotBoundingBox.subscribe((box) => {
    if (box) {
      if (box.width > box.height) {
        rotation.set(0);
        width.set(box.width);
        height.set(box.height);
        left.set(box.left);
        top.set(box.top);
      } else {
        rotation.set(90);
        let centreY = box.top + box.height / 2;
        let centreX = box.left + box.width / 2;
        width.set(box.height);
        height.set(box.width);
        top.set(centreY - box.width / 2);
        left.set(centreX - box.height / 2);
      }
      opacity.set(0.2);
      setTimeout(() => opacity.set(1), 200);
    }
  });
</script>

<div
  class="selectionBox"
  style:left={$left - gap + "px"}
  style:top={$top - gap + "px"}
  style:width={$width + gap + "px"}
  style:height={$height + gap + "px"}
  style:--rotation={$rotation + "deg"}
  style:opacity={$opacity}
/>

<style lang="scss">
  .selectionBox {
    box-sizing: border-box;
    position: absolute;
    border: 2px solid rgb(120, 198, 2);
    border-radius: 3px;
    background-color: rgba(146, 255, 146, 0.189);
    z-index: 10;
    pointer-events: none;
    opacity: 1;
    transform: rotate(var(--rotation));
  }
</style>
