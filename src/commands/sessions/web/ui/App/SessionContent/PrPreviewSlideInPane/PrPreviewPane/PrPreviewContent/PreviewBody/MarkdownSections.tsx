import Box from "@mui/material/Box";
import {
	type ReactNode,
	type RefObject,
	useLayoutEffect,
	useMemo,
} from "react";
import { MarkdownHtml } from "../../../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdown } from "../../../../../../../../../backlog/web/ui/components/renderMarkdown";
import {
	applyHighlights,
	clearHighlights,
} from "./MarkdownSections/applyHighlights";

type ColoredOffsets = { start: number; end: number; color: string };

export function MarkdownSections({
	content,
	control,
	trailing,
	ranges,
	contentRef,
}: {
	content: string;
	control: ReactNode;
	trailing: string | undefined;
	ranges: ColoredOffsets[];
	contentRef: RefObject<HTMLDivElement | null>;
}) {
	const html = useMemo(() => renderMarkdown(content), [content]);
	const trailingHtml = useMemo(
		() => (trailing ? renderMarkdown(trailing) : ""),
		[trailing],
	);

	useLayoutEffect(() => {
		const root = contentRef.current;
		if (!root) return;
		clearHighlights(root);
		applyHighlights(root, ranges);
	}, [html, trailingHtml, ranges, contentRef]);

	return (
		<Box ref={contentRef}>
			<MarkdownHtml className="markdown" html={html} />
			{control}
			{control ? (
				<MarkdownHtml className="markdown" html={trailingHtml} />
			) : null}
		</Box>
	);
}
