import type { PointerEvent } from "react";
import type { RowGestureDeps } from "./RowGestureDeps";
import { rowGestureEnd } from "./rowGestureEnd";
import { startRowGesture } from "./rowGestureMove";
import { rowPointerMove } from "./rowPointerMove";

export function rowPointerHandlers(deps: RowGestureDeps) {
	const { gesture, swipe, longPress } = deps;
	const end = rowGestureEnd(deps);
	const onPointerDown = (e: PointerEvent) => {
		swipe.swallowClick.current = false;
		gesture.current = startRowGesture(e, swipe.offset);
		longPress.arm(() => {
			swipe.swallowClick.current = true;
			gesture.current = null;
		});
	};

	return {
		onPointerDown,
		onPointerMove: rowPointerMove(deps, end),
		onPointerUp: end,
		onPointerCancel: end,
		onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
	};
}
