import Box from "@mui/material/Box";
import { marked } from "marked";
import { type RefObject, useLayoutEffect, useMemo } from "react";
import { applyHighlights } from "./applyHighlights";

type Offsets = { start: number; end: number };

const sx = {
	flex: 1,
	overflow: "auto",
	p: 2,
	lineHeight: 1.7,
	wordBreak: "break-word",
	"& p": { mt: 0 },
	"& mark.pr-comment": {
		backgroundColor: "rgba(255, 196, 0, 0.4)",
		color: "inherit",
		borderRadius: "2px",
	},
} as const;

export function PreviewBody({
	content,
	ranges,
	rootRef,
	onMouseUp,
}: {
	content: string;
	ranges: Offsets[];
	rootRef: RefObject<HTMLDivElement | null>;
	onMouseUp: () => void;
}) {
	const html = useMemo(() => marked.parse(content) as string, [content]);
	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		root.innerHTML = html;
		applyHighlights(root, ranges);
	}, [html, ranges, rootRef]);

	return (
		<Box ref={rootRef} className="markdown" onMouseUp={onMouseUp} sx={sx} />
	);
}
