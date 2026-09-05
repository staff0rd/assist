import { type Caret, caretFromPoint } from "./caretFromPoint";
import type { LinkDragGuard } from "./linkDragGuard";

type SelectionElements = { wrapper: HTMLElement; content: HTMLElement };

export type DragSelectionHandlers = {
	onStart?: () => void;
	onMove?: (anchor: Caret, focus: Caret, els: SelectionElements) => void;
	onEnd: (anchor: Caret, focus: Caret, els: SelectionElements) => void;
};

const DRAG_THRESHOLD_PX = 3;

export function trackDragSelection({
	anchor,
	origin,
	els,
	guard,
	handlers,
}: {
	anchor: Caret;
	origin: { x: number; y: number };
	els: SelectionElements;
	guard: LinkDragGuard | null;
	handlers: DragSelectionHandlers;
}): void {
	let dragging = guard === null;
	if (dragging) handlers.onStart?.();

	const passedThreshold = (ev: MouseEvent) =>
		Math.abs(ev.clientX - origin.x) >= DRAG_THRESHOLD_PX ||
		Math.abs(ev.clientY - origin.y) >= DRAG_THRESHOLD_PX;

	const handleMove = (ev: MouseEvent) => {
		if (!dragging) {
			if (!passedThreshold(ev)) return;
			dragging = true;
			handlers.onStart?.();
		}
		const focus = caretFromPoint(ev.clientX, ev.clientY);
		if (focus) handlers.onMove?.(anchor, focus, els);
	};
	const handleUp = (ev: MouseEvent) => {
		globalThis.removeEventListener("mousemove", handleMove);
		globalThis.removeEventListener("mouseup", handleUp);
		guard?.release(dragging);
		if (!dragging) return;
		const focus = caretFromPoint(ev.clientX, ev.clientY) ?? anchor;
		handlers.onEnd(anchor, focus, els);
	};
	globalThis.addEventListener("mousemove", handleMove);
	globalThis.addEventListener("mouseup", handleUp);
}
