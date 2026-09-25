import { useState } from "react";
import { type OverlayRect, overlayRects } from "./caretFromPoint";
import { finishSelection, snappedRange } from "./finishSelection";
import type { PendingComment } from "./PendingComment";
import { useDragSelection } from "./useDragSelection";

export function usePreviewSelection() {
	const [dragRects, setDragRects] = useState<OverlayRect[] | null>(null);
	const [pending, setPending] = useState<PendingComment | null>(null);

	const { wrapperRef, contentRef, onMouseDown } = useDragSelection({
		onStart: () => {
			setPending(null);
			setDragRects([]);
		},
		onMove: (anchor, focus, { wrapper }) =>
			setDragRects(overlayRects(snappedRange(anchor, focus), wrapper)),
		onEnd: (anchor, focus, { content }) => {
			setDragRects(null);
			setPending(finishSelection(content, anchor, focus));
		},
	});

	const clear = () => setPending(null);

	return { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear };
}
