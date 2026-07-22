import { type MouseEvent as ReactMouseEvent, useRef, useState } from "react";
import {
	type Caret,
	caretFromPoint,
	type OverlayRect,
	overlayRects,
} from "./caretFromPoint";
import { finishSelection, snappedRange, startCaret } from "./finishSelection";
import type { PendingComment } from "./PrCommentPopover";

export function usePreviewSelection() {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<Caret | null>(null);
	const [dragRects, setDragRects] = useState<OverlayRect[] | null>(null);
	const [pending, setPending] = useState<PendingComment | null>(null);

	const onMouseDown = (e: ReactMouseEvent) => {
		const wrapper = wrapperRef.current;
		const content = contentRef.current;
		if (!wrapper || !content) return;
		const anchor = startCaret(wrapper, content, e.clientX, e.clientY);
		if (!anchor) return;

		e.preventDefault();
		anchorRef.current = anchor;
		setPending(null);
		setDragRects([]);

		const onMove = (ev: globalThis.MouseEvent) => {
			const focus = caretFromPoint(ev.clientX, ev.clientY);
			if (focus && anchorRef.current)
				setDragRects(
					overlayRects(snappedRange(anchorRef.current, focus), wrapper),
				);
		};
		const onUp = (ev: globalThis.MouseEvent) => {
			globalThis.removeEventListener("mousemove", onMove);
			globalThis.removeEventListener("mouseup", onUp);
			setDragRects(null);
			const anchorAtStart = anchorRef.current;
			anchorRef.current = null;
			if (!anchorAtStart) return;
			const focus = caretFromPoint(ev.clientX, ev.clientY) ?? anchorAtStart;
			setPending(finishSelection(content, anchorAtStart, focus));
		};
		globalThis.addEventListener("mousemove", onMove);
		globalThis.addEventListener("mouseup", onUp);
	};

	const clear = () => setPending(null);

	return { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear };
}
