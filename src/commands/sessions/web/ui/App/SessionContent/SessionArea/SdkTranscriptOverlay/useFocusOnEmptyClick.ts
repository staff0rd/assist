import { type MouseEvent, type RefObject, useRef } from "react";
import { isFocusHeld } from "../../../holdFocus";
import { isEmptySpaceClick } from "./isEmptySpaceClick";

const DRAG_THRESHOLD_PX = 3;

export function useFocusOnEmptyClick(
	inputRef: RefObject<HTMLTextAreaElement | null>,
) {
	const downAt = useRef<{ x: number; y: number } | null>(null);

	const onMouseDown = (e: MouseEvent) => {
		downAt.current = { x: e.clientX, y: e.clientY };
	};

	const dragged = (e: MouseEvent) => {
		const start = downAt.current;
		return (
			start !== null &&
			(Math.abs(e.clientX - start.x) >= DRAG_THRESHOLD_PX ||
				Math.abs(e.clientY - start.y) >= DRAG_THRESHOLD_PX)
		);
	};

	const onClick = (e: MouseEvent<HTMLElement>) => {
		const input = inputRef.current;
		// Portaled children (e.g. the comment popover) bubble through the React tree.
		if (!(e.target instanceof Node) || !e.currentTarget.contains(e.target))
			return;
		if (!input || input.disabled || isFocusHeld() || dragged(e)) return;
		if (isEmptySpaceClick(e)) input.focus({ preventScroll: true });
	};

	return { onMouseDown, onClick };
}
