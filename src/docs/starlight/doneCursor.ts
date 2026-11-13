import { changeCursor } from "./changeCursor";
import { changeKey } from "./changeKey";
import type { DoneStore } from "./doneStore";

export function doneCursor(
	pageId: string,
	changes: Element[][],
	position: HTMLElement,
	store: DoneStore,
) {
	const keys = changes.map((change) => changeKey(pageId, change));
	const cursor = changeCursor(changes, position);
	return {
		get current() {
			return cursor.current;
		},
		show(index: number) {
			cursor.show(index);
			if (store.isDone(keys[cursor.current])) position.textContent += " · done";
		},
		firstPending: (from: number) =>
			keys.findIndex((key, index) => index >= from && !store.isDone(key)),
		left: () => keys.filter((key) => !store.isDone(key)).length,
		setCurrentDone(isDone: boolean) {
			if (cursor.current >= 0) store.setDone(keys[cursor.current], isDone);
		},
	};
}
