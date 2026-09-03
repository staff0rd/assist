import Box from "@mui/material/Box";
import { DragOverlay } from "./DragOverlay";
import { MarkdownSections } from "./MarkdownSections";
import { previewBodySx } from "./previewBodySx";
import type { PreviewBodyProps } from "./PreviewBodyProps";

export function PreviewBody({
	content,
	control,
	trailing,
	ranges,
	wrapperRef,
	contentRef,
	dragRects,
	dragColor,
	onMouseDown,
	footer,
}: PreviewBodyProps) {
	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={previewBodySx}>
			<MarkdownSections
				content={content}
				control={control}
				trailing={trailing}
				ranges={ranges}
				contentRef={contentRef}
			/>
			{footer && <Box sx={{ userSelect: "text" }}>{footer}</Box>}
			<DragOverlay rects={dragRects} color={dragColor} />
		</Box>
	);
}
