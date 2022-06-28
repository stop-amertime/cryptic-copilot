import {writable} from 'svelte/store'

export const dictionary = writable(null as IDictionaryOrPromise);
export const gridTemplate = writable(null as IGridLayoutOrPromise);
export const selectedSlotId = writable(null as number);
export const selectedSlotWord = writable(null as ISlotWord);
export const wordSlots = writable([] as IWordSlot[]);
