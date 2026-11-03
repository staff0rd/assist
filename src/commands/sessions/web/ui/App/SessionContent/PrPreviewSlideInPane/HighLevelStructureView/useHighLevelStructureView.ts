import type { HighLevelTreeNode } from "../../../../../../../review/highLevel/types";
import { useDiffViewType } from "../../../useDiffViewType";
import { useHighLevelStructureCollapse } from "./useHighLevelStructureCollapse";
import { useHighLevelStructureMatch } from "./useHighLevelStructureMatch";
import { useStructureToolbarOffset } from "./useStructureToolbarOffset";

export function useHighLevelStructureView(
	subject: string,
	tree: HighLevelTreeNode[],
	collapsedPaths: string[],
) {
	const { dirs, files, fileGlobs, filePaths, bulk } =
		useHighLevelStructureCollapse(subject, tree, collapsedPaths);
	const { viewType, onChange } = useDiffViewType();
	const match = useHighLevelStructureMatch(filePaths, collapsedPaths);
	const { toolbarRef, offsetSx } = useStructureToolbarOffset();
	return {
		offsetSx,
		toolbar: {
			ref: toolbarRef,
			bulk,
			viewType,
			onChangeViewType: onChange,
			...match,
		},
		tree: {
			glob: match.glob,
			nodes: tree,
			collapsed: dirs.collapsed,
			onToggleDir: dirs.onToggle,
			collapsedFiles: files.collapsed,
			onToggleFile: files.onToggle,
			fileGlobs,
			matches: match.matches,
			viewType,
		},
	};
}
