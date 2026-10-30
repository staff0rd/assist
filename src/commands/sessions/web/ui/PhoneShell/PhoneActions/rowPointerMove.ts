import type { PointerEvent } from "react";
import type { RowGestureDeps } from "./RowGestureDeps";
import { rowGestureMove } from "./rowGestureMove";

export function rowPointerMove(
	{ gesture, swipe, longPress, revealWidth }: RowGestureDeps,
	end: () => void,
) {
	return (e: PointerEvent) => {
		const g = gesture.current;
		if (!g) return;
		const move = rowGestureMove(g, e.clientX, e.clientY, revealWidth);
		if (move.kind === "scroll") end();
		if (move.kind !== "swipe") return;
		if (move.started) {
			longPress.cancel();
			g.swiping = true;
			swipe.setDragging(true);
		}
		swipe.setOffset(move.offset);
	};
}
