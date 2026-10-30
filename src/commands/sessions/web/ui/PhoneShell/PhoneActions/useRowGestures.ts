import { useRef } from "react";
import type { RowGesture } from "./rowGestureMove";
import { rowPointerHandlers } from "./rowPointerHandlers";
import { useLongPress } from "./useLongPress";
import { useSwipeOffset } from "./useSwipeOffset";

export function useRowGestures(revealWidth: number, onLongPress: () => void) {
	const swipe = useSwipeOffset();
	const gesture = useRef<RowGesture | null>(null);
	const longPress = useLongPress(onLongPress);
	return {
		...swipe,
		handlers: rowPointerHandlers({ gesture, swipe, longPress, revealWidth }),
	};
}
