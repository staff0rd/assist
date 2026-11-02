import { useMemo } from "react";
import { sliceHighLevelStructures } from "../../../../../../../review/highLevel/sliceHighLevelStructures";
import { sliceHighLevelTests } from "../../../../../../../review/highLevel/sliceHighLevelTests";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";

export function useSlicedHighLevelReview(
	structure: HighLevelStructure,
	slices: HighLevelSlice[],
	tests: HighLevelTestFile[],
	criticalPaths: string[],
) {
	return useMemo(
		() => ({
			structures: sliceHighLevelStructures(
				structure,
				slices,
				new Set(tests.map((file) => file.path)),
				new Set(criticalPaths),
			),
			tests: sliceHighLevelTests(tests, slices),
		}),
		[structure, slices, tests, criticalPaths],
	);
}
