import { useMemo } from "react";
import type { HighLevelTreeNode } from "../../../../../../../review/highLevel/types";
import { useHighLevelCollapse } from "../useHighLevelCollapse";
import { flattenHighLevelTree } from "./flattenHighLevelTree";
import { countHighLevelDiffs } from "../countHighLevelDiffs";
import { flattenHighLevelDirs } from "./useHighLevelStructureCollapse/flattenHighLevelDirs";
import { highLevelCollapseDefaults } from "./useHighLevelStructureCollapse/highLevelCollapseDefaults";
import { highLevelStructureBulk } from "./highLevelStructureBulk";

export function useHighLevelStructureCollapse(
	subject: string,
	tree: HighLevelTreeNode[],
	collapsedPaths: string[],
	collapseAllFiles = false,
) {
	const defaults = useMemo(
		() => highLevelCollapseDefaults(tree, collapsedPaths),
		[tree, collapsedPaths],
	);
	const filePaths = useMemo(
		() => flattenHighLevelTree(tree).map((file) => file.path),
		[tree],
	);
	const defaultFiles = useMemo(
		() => (collapseAllFiles ? new Set(filePaths) : defaults.files),
		[collapseAllFiles, filePaths, defaults.files],
	);
	const dirPaths = useMemo(() => flattenHighLevelDirs(tree), [tree]);
	const dirs = useHighLevelCollapse(subject, defaults.dirs);
	const files = useHighLevelCollapse(`files:${subject}`, defaultFiles);
	const bulk = highLevelStructureBulk(
		dirs,
		files,
		dirPaths,
		filePaths,
		countHighLevelDiffs(tree, dirs.collapsed, files.collapsed),
	);

	return { dirs, files, fileGlobs: defaults.fileGlobs, filePaths, bulk };
}
