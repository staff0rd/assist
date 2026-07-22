import Box from "@mui/material/Box";
import { marked } from "marked";
import {
	type MouseEvent as ReactMouseEvent,
	type RefObject,
	useLayoutEffect,
	useMemo,
} from "react";
import { applyHighlights } from "./applyHighlights";
import type { OverlayRect } from "./caretFromPoint";
import { DragOverlay } from "./DragOverlay";

type ColoredOffsets = { start: number; end: number; color: string };

const wrapperSx = {
	flex: 1,
	overflow: "auto",
	p: 2,
	position: "relative",
	userSelect: "none",
	cursor: "text",
	lineHeight: 1.7,
	wordBreak: "break-word",
	"& p": { mt: 0 },
	"& mark.pr-comment": {
		color: "inherit",
		borderRadius: "2px",
	},
} as const;

export function PreviewBody({
	content,
	ranges,
	wrapperRef,
	contentRef,
	dragRects,
	dragColor,
	onMouseDown,
}: {
	content: string;
	ranges: ColoredOffsets[];
	wrapperRef: RefObject<HTMLDivElement | null>;
	contentRef: RefObject<HTMLDivElement | null>;
	dragRects: OverlayRect[] | null;
	dragColor: string;
	onMouseDown: (e: ReactMouseEvent) => void;
}) {
	const html = useMemo(() => marked.parse(content) as string, [content]);
	useLayoutEffect(() => {
		const root = contentRef.current;
		if (!root) return;
		root.innerHTML = html;
		applyHighlights(root, ranges);
	}, [html, ranges, contentRef]);

	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={wrapperSx}>
			<Box ref={contentRef} className="markdown" />
			<DragOverlay rects={dragRects} color={dragColor} />
		</Box>
	);
}
