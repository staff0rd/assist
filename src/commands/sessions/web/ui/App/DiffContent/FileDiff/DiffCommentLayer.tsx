import Box from "@mui/material/Box";
import { type ReactNode, useMemo } from "react";
import type { HunkData } from "react-diff-view";
import { buildChangeIndex } from "./DiffCommentLayer/buildChangeIndex";
import { commentColor } from "../../commentColor";
import { diffCommentFrom } from "./DiffCommentLayer/diffCommentFrom";
import { DragOverlay } from "../../DragOverlay";
import type { AddRuleRequest } from "../../formatAddRuleCommand";
import type { DiffComment } from "../../formatDiffComment";
import { ruleCitationNote } from "../../ruleCitationNote";
import { selectionActions } from "../../selectionActions";
import { SelectionCommentPopover } from "../../SelectionCommentPopover";
import { selectionLayerSx } from "../../selectionLayerSx";
import { useDiffSelection } from "./DiffCommentLayer/useDiffSelection";

export function DiffCommentLayer({
	path,
	cwd,
	hunks,
	onComment,
	onAddRule,
	children,
}: {
	path: string;
	cwd?: string | undefined;
	hunks: HunkData[];
	onComment?: (comment: DiffComment) => void;
	onAddRule?: (request: AddRuleRequest) => void;
	children: ReactNode;
}) {
	const index = useMemo(() => buildChangeIndex(hunks), [hunks]);
	const { wrapperRef, contentRef, pending, rects, onMouseDown, clear } =
		useDiffSelection(index);

	if (!onComment) return <>{children}</>;

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
			<SelectionCommentPopover
				pending={pending}
				moved={pending?.moved}
				cwd={cwd}
				path={path}
				onAdd={add}
				onCite={(rule) => add(ruleCitationNote(rule))}
				onAddRule={addRule}
				onCancel={clear}
			/>
		</Box>
	);
}
