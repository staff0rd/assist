import Box from "@mui/material/Box";
import { type ReactNode, useMemo } from "react";
import type { HunkData } from "react-diff-view";
import { buildChangeIndex } from "./DiffCommentLayer/buildChangeIndex";
import { commentColor } from "./commentColor";
import { diffCommentFrom } from "./DiffCommentLayer/diffCommentFrom";
import { CommentPopover } from "./CommentPopover";
import { DragOverlay } from "./DragOverlay";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { DiffComment } from "./formatDiffComment";
import { selectionActions } from "./selectionActions";
import { selectionLayerSx } from "./selectionLayerSx";
import { useDiffSelection } from "./DiffCommentLayer/useDiffSelection";

export function DiffCommentLayer({
	path,
	cwd,
	hunks,
	onComment,
	onAddRule,
	unavailable,
	children,
}: {
	path: string;
	cwd?: string | undefined;
	hunks: HunkData[];
	onComment?: ((comment: DiffComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
	children: ReactNode;
}) {
	const index = useMemo(() => buildChangeIndex(hunks), [hunks]);
	const { wrapperRef, contentRef, pending, rects, onMouseDown, clear } =
		useDiffSelection(index);

	if (!onComment && !unavailable) return <>{children}</>;

	const { add, addRule } = selectionActions({
		path,
		pending,
		clear,
		onComment,
		onAddRule,
		build: (selection, note) => diffCommentFrom(path, selection, note),
	});

	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={selectionLayerSx}>
			<Box ref={contentRef}>{children}</Box>
			<DragOverlay rects={rects} color={commentColor(0).fill} />
			<CommentPopover
				pending={pending}
				moved={pending?.moved}
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
