import { useMemo } from "react";
import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { useHighLevelCollapse } from "../useHighLevelCollapse";
import { slicedCollapseLayout } from "./slicedCollapseLayout";
import { slicedStructureBulk } from "./slicedStructureBulk";
import { sliceKey, unkeyed } from "./sliceKey";

export function useSlicedStructureCollapse(
	subject: string,
	structures: HighLevelStructure[],
	collapsedPaths: string[],
	inView: ReadonlySet<number>,
) {
	const layout = useMemo(
		() => slicedCollapseLayout(structures, collapsedPaths),
		[structures, collapsedPaths],
	);
	const dirs = useHighLevelCollapse(`${subject}:slices`, layout.defaultDirs);
	const files = useHighLevelCollapse(
		`files:${subject}:slices`,
		layout.defaultFiles,
	);

	const views = layout.slices.map((slice) => ({
		collapsed: unkeyed(slice.number, dirs.collapsed),
		onToggleDir: (path: string) => dirs.onToggle(sliceKey(slice.number, path)),
		collapsedFiles: unkeyed(slice.number, files.collapsed),
		onToggleFile: (path: string) =>
			files.onToggle(sliceKey(slice.number, path)),
		fileGlobs: slice.defaults.fileGlobs,
	}));
	const bulk = slicedStructureBulk(
		dirs,
		files,
		layout.slices.filter((slice) => inView.has(slice.number)),
	);
	return { views, bulk, filePathsBySlice: layout.filePathsBySlice };
}
