import { pathOfHunkRef } from "./pathOfHunkRef";
import type { HighLevelSlice } from "./types";

type SliceRef = { number: number; title: string };

export function highLevelSlicesByPath(
	slices: HighLevelSlice[],
): Map<string, SliceRef[]> {
	const byPath = new Map<string, SliceRef[]>();
	slices.forEach((slice, index) => {
		const ref = { number: index + 1, title: slice.title };
		for (const path of new Set(slice.hunks.map(pathOfHunkRef)))
			byPath.set(path, [...(byPath.get(path) ?? []), ref]);
	});
	return byPath;
}
