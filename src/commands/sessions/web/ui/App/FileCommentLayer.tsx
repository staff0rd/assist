import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { commentColor } from "./commentColor";
import { DragOverlay } from "./DragOverlay";
import { fileCommentFrom } from "./FileCommentLayer/fileCommentFrom";
import { FileCommentPopover } from "./FileCommentLayer/FileCommentPopover";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { FileComment } from "./formatFileComment";
import { selectionActions } from "./selectionActions";
import { selectionLayerSx } from "./selectionLayerSx";
import { usePreviewSelection } from "./usePreviewSelection";

export function FileCommentLayer({
	path,
	cwd,
	source,
	onComment,
	onAddRule,
	unavailable,
	children,
}: {
	path: string;
	cwd: string | undefined;
	source: string;
	onComment?: ((comment: FileComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
	children: ReactNode;
}) {
	const { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear } =
		usePreviewSelection();
	const { add, addRule } = selectionActions({
		path,
		pending,
		clear,
		onComment,
		onAddRule,
		build: (selection, note) => fileCommentFrom(path, source, selection, note),
	});

	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={selectionLayerSx}>
			<Box ref={contentRef}>{children}</Box>
			<DragOverlay rects={dragRects} color={commentColor(0).fill} />
			<FileCommentPopover
				pending={pending}
				cwd={cwd}
				path={path}
				unavailable={unavailable}
				onAdd={add}
				onAddRule={addRule}
				onCancel={clear}
			/>
		</Box>
	);
}
