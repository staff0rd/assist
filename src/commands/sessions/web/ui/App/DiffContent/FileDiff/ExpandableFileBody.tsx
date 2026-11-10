import type { FileData, ViewType } from "react-diff-view";
import { DiffCommentLayer } from "../../DiffCommentLayer";
import { diffGapRenderer } from "../../diffGaps/diffGapRenderer";
import type { GapExpansion } from "../../diffGaps/useGapExpansion";
import { FileDiffBody } from "../../FileDiffBody";
import type { FileDiffProps } from "./FileDiffProps";

export function ExpandableFileBody({
	path,
	cwd,
	viewType,
	expanded,
	expansion,
	onComment,
	onAddRule,
}: Pick<FileDiffProps, "cwd" | "viewType" | "onComment" | "onAddRule"> & {
	path: string;
	expanded: FileData;
	expansion: GapExpansion;
	viewType: ViewType;
}) {
	return (
		<DiffCommentLayer
			path={path}
			cwd={cwd}
			hunks={expanded.hunks}
			onComment={onComment}
			onAddRule={onAddRule}
		>
			<FileDiffBody
				file={expanded}
				path={path}
				viewType={viewType}
				renderGap={diffGapRenderer(expansion)}
			/>
		</DiffCommentLayer>
	);
}
