import type { ViewType } from "react-diff-view";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";
import type { useSlicedStructureCollapse } from "./useSlicedStructureCollapse";

type SliceView = ReturnType<typeof useSlicedStructureCollapse>["views"][number];

export function slicedStructureSections({
	slices,
	structures,
	tests,
	views,
	inView,
	glob,
	sliceMatches,
	viewType,
}: {
	slices: HighLevelSlice[];
	structures: HighLevelStructure[];
	tests: HighLevelTestFile[][];
	views: SliceView[];
	inView: ReadonlySet<number>;
	glob: string;
	sliceMatches: Set<string>[];
	viewType: ViewType;
}) {
	return slices.flatMap((slice, index) => {
		const view = views[index];
		const structure = structures[index];
		if (!inView.has(index + 1) || !view || !structure) return [];
		return [
			{
				number: index + 1,
				slice,
				structure,
				tests: tests[index] ?? [],
				tree: {
					...view,
					glob,
					matches: sliceMatches[index] ?? new Set<string>(),
					viewType,
				},
			},
		];
	});
}
