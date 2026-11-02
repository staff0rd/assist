import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { useSlicedStructureCollapse } from "./useSlicedStructureCollapse";
import { useSlicedStructureMatch } from "./useSlicedStructureMatch";

export function useSlicedStructureTrees(
	subject: string,
	structures: HighLevelStructure[],
	collapsedPaths: string[],
	inView: ReadonlySet<number>,
) {
	const { views, bulk, filePathsBySlice } = useSlicedStructureCollapse(
		subject,
		structures,
		collapsedPaths,
		inView,
	);
	const { sliceMatches, ...match } = useSlicedStructureMatch(
		filePathsBySlice,
		collapsedPaths,
		inView,
	);
	return { views, bulk, sliceMatches, match };
}
