import { highLevelSlicesByPath } from "../../../../../../../review/highLevel/highLevelSlicesByPath";
import { sliceHighLevelStructures } from "../../../../../../../review/highLevel/sliceHighLevelStructures";
import { sliceHighLevelTests } from "../../../../../../../review/highLevel/sliceHighLevelTests";
import type {
	HighLevelCriticalDiff,
	HighLevelPreviewPayload,
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";

export type HighLevelSliceView = {
	number: number;
	slice: HighLevelSlice;
	structure: HighLevelStructure;
	tests: HighLevelTestFile[];
	critical: HighLevelCriticalDiff[];
};

export function highLevelSliceViews(
	payload: HighLevelPreviewPayload,
	slices: HighLevelSlice[],
): HighLevelSliceView[] {
	const structures = sliceHighLevelStructures(
		payload.structure,
		slices,
		new Set(payload.tests.map((file) => file.path)),
		new Set(payload.criticalDiffs.map((diff) => diff.path)),
	);
	const tests = sliceHighLevelTests(payload.tests, slices);
	const byPath = highLevelSlicesByPath(slices);
	return slices.map((slice, index) => {
		const number = index + 1;
		return {
			number,
			slice,
			structure: structures[index] ?? payload.structure,
			tests: tests[index] ?? [],
			critical: payload.criticalDiffs.filter((diff) =>
				byPath.get(diff.path)?.some((ref) => ref.number === number),
			),
		};
	});
}
