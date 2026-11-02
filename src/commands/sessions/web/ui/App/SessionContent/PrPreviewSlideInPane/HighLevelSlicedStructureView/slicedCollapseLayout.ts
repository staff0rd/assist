import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { flattenHighLevelTree } from "../HighLevelStructureView/flattenHighLevelTree";
import { flattenHighLevelDirs } from "../HighLevelStructureView/useHighLevelStructureCollapse/flattenHighLevelDirs";
import { highLevelCollapseDefaults } from "../HighLevelStructureView/useHighLevelStructureCollapse/highLevelCollapseDefaults";
import { keyed } from "./sliceKey";

export type SlicedCollapseSlice = ReturnType<
	typeof slicedCollapseLayout
>["slices"][number];

export function slicedCollapseLayout(
	structures: HighLevelStructure[],
	collapsedPaths: string[],
) {
	const slices = structures.map((structure, index) => ({
		number: index + 1,
		tree: structure.tree,
		defaults: highLevelCollapseDefaults(structure.tree, collapsedPaths),
		filePaths: flattenHighLevelTree(structure.tree).map((file) => file.path),
		dirPaths: flattenHighLevelDirs(structure.tree),
	}));
	return {
		slices,
		defaultDirs: new Set(
			slices.flatMap((slice) => keyed(slice.number, slice.defaults.dirs)),
		),
		defaultFiles: new Set(
			slices.flatMap((slice) => keyed(slice.number, slice.defaults.files)),
		),
		filePathsBySlice: slices.map((slice) => slice.filePaths),
	};
}
