import { type MouseEvent as ReactMouseEvent, useRef } from "react";
import { startCaret } from "./finishSelection";
import { linkDragGuard } from "./linkDragGuard";
import {
	type DragSelectionHandlers,
	trackDragSelection,
} from "./trackDragSelection";

export function useDragSelection(handlers: DragSelectionHandlers) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const onMouseDown = (e: ReactMouseEvent) => {
		const wrapper = wrapperRef.current;
		const content = contentRef.current;
		if (!wrapper || !content) return;
		const anchor = startCaret(wrapper, content, e.clientX, e.clientY);
		if (!anchor) return;

		const guard = linkDragGuard(e.target);
		if (!guard) e.preventDefault();

		trackDragSelection({
			anchor,
			origin: { x: e.clientX, y: e.clientY },
			els: { wrapper, content },
			guard,
			handlers,
		});
	};

	return { wrapperRef, contentRef, onMouseDown };
}
