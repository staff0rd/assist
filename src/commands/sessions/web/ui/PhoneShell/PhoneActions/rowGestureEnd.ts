import type { RowGestureDeps } from "./RowGestureDeps";
import { snapOffset } from "./rowGestureMove";

export function rowGestureEnd({
	gesture,
	swipe,
	longPress,
	revealWidth,
}: RowGestureDeps) {
	return () => {
		const g = gesture.current;
		longPress.cancel();
		gesture.current = null;
		swipe.setDragging(false);
		if (!g?.swiping) return;
		swipe.swallowClick.current = true;
		swipe.setOffset((o) => snapOffset(o, revealWidth));
	};
}
