import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { CommentPopover } from "./CommentPopover";
import { commentColor } from "./commentColor";
import { DragOverlay } from "./DragOverlay";
import { selectionLayerSx } from "./selectionLayerSx";
import type { usePreviewSelection } from "./usePreviewSelection";

export function SelectionCommentLayer({
	selection,
	path,
	cwd,
	unavailable,
	onAdd,
	onQueue,
	onAddRule,
	children,
}: {
	selection: ReturnType<typeof usePreviewSelection>;
	path: string;
	cwd: string | undefined;
	unavailable?: string | undefined;
	onAdd: (note: string) => void;
	onQueue?: ((note: string) => void) | undefined;
	onAddRule: ((note: string) => void) | undefined;
	children: ReactNode;
}) {
	const { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear } =
		selection;
	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={selectionLayerSx}>
			<Box ref={contentRef}>{children}</Box>
			<DragOverlay rects={dragRects} color={commentColor(0).fill} />
			<CommentPopover
				pending={pending}
				cwd={cwd}
				path={path}
				unavailable={unavailable}
				onAdd={onAdd}
				onQueue={onQueue}
				onAddRule={onAddRule}
				onCancel={clear}
			/>
		</Box>
	);
}
