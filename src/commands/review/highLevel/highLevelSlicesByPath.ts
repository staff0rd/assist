import { pathOfHunkRef } from "./pathOfHunkRef";
import type { HighLevelSlice, HighLevelSliceRef } from "./types";

export function highLevelSlicesByPath(
	slices: HighLevelSlice[],
): Map<string, HighLevelSliceRef[]> {
	const byPath = new Map<string, HighLevelSliceRef[]>();
	slices.forEach((slice, index) => {
		const ref = { number: index + 1, title: slice.title };
		for (const path of new Set(slice.hunks.map(pathOfHunkRef)))
			byPath.set(path, [...(byPath.get(path) ?? []), ref]);
	});
	return byPath;
}
