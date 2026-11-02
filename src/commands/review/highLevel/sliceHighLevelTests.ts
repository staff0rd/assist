import { pathOfHunkRef } from "./pathOfHunkRef";
import type { HighLevelSlice, HighLevelTestFile } from "./types";

function claimingSlice(path: string, slices: HighLevelSlice[]): number {
	let best = -1;
	let bestCount = 0;
	slices.forEach((slice, index) => {
		const count = slice.hunks.filter(
			(ref) => pathOfHunkRef(ref) === path,
		).length;
		if (count > bestCount) {
			best = index;
			bestCount = count;
		}
	});
	return best;
}

export function sliceHighLevelTests(
	tests: HighLevelTestFile[],
	slices: HighLevelSlice[],
): HighLevelTestFile[][] {
	const bySlice = slices.map((): HighLevelTestFile[] => []);
	for (const file of tests)
		bySlice[claimingSlice(file.path, slices)]?.push(file);
	return bySlice;
}
