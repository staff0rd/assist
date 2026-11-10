import Box from "@mui/material/Box";
import {
	type ReactNode,
	type RefObject,
	useLayoutEffect,
	useMemo,
} from "react";
import { MarkdownSegments } from "../../../../../../../../../backlog/web/ui/components/MarkdownSegments";
import { splitMarkdownSegments } from "../../../../../../../../../backlog/web/ui/components/splitMarkdownSegments";
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
	const segments = useMemo(() => splitMarkdownSegments(content), [content]);
	const trailingSegments = useMemo(
		() => splitMarkdownSegments(trailing ?? ""),
		[trailing],
	);

	useLayoutEffect(() => {
		const root = contentRef.current;
		if (!root) return;
		clearHighlights(root);
		applyHighlights(root, ranges);
	}, [segments, trailingSegments, ranges, contentRef]);

	return (
		<Box ref={contentRef}>
			<MarkdownSegments segments={segments} skipDiagramText />
			{control}
			{control ? (
				<MarkdownSegments segments={trailingSegments} skipDiagramText />
			) : null}
		</Box>
	);
}
