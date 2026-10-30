import type { RefObject } from "react";
import type { RowGesture } from "./rowGestureMove";
import type { useLongPress } from "./useLongPress";
import type { useSwipeOffset } from "./useSwipeOffset";

export type RowGestureDeps = {
	gesture: RefObject<RowGesture | null>;
	swipe: ReturnType<typeof useSwipeOffset>;
	longPress: ReturnType<typeof useLongPress>;
	revealWidth: number;
};
