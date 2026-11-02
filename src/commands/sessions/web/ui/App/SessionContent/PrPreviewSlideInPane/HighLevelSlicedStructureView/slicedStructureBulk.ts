import { countHighLevelDiffs } from "../countHighLevelDiffs";
import { highLevelStructureBulk } from "../HighLevelStructureView/highLevelStructureBulk";
import type { useHighLevelCollapse } from "../useHighLevelCollapse";
import type { SlicedCollapseSlice } from "./slicedCollapseLayout";
import { keyed, unkeyed } from "./sliceKey";

type Collapse = ReturnType<typeof useHighLevelCollapse>;

export function slicedStructureBulk(
	dirs: Collapse,
	files: Collapse,
	shown: SlicedCollapseSlice[],
) {
	const counts = { open: 0, collapsed: 0 };
	for (const slice of shown) {
		const count = countHighLevelDiffs(
			slice.tree,
			unkeyed(slice.number, dirs.collapsed),
			unkeyed(slice.number, files.collapsed),
		);
		counts.open += count.open;
		counts.collapsed += count.collapsed;
	}
	const dirPaths = shown.flatMap((slice) =>
		keyed(slice.number, slice.dirPaths),
	);
	const filePaths = shown.flatMap((slice) =>
		keyed(slice.number, slice.filePaths),
	);
	return {
		...highLevelStructureBulk(dirs, files, dirPaths, filePaths, counts),
		reset: () => {
			dirs.onReset(dirPaths);
			files.onReset(filePaths);
		},
	};
}
