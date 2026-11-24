import { flattenTestCases } from "./flattenTestCases";
import { patchAddedLines } from "./patchAddedLines";
import { patchBaseLines } from "./patchBaseLines";
import { placeHeadCases } from "./placeHeadCases";
import { placeRemovedCases } from "./placeRemovedCases";
import { placeTestCases } from "./placeTestCases";
import type { HighLevelTestNode } from "./types";

export function diffTestHierarchies(
	path: string,
	head: HighLevelTestNode[],
	base: HighLevelTestNode[],
	patch: string,
): HighLevelTestNode[] {
	const { removed, toHead } = patchBaseLines(patch);
	const headCases = flattenTestCases(head);
	const baseCases = flattenTestCases(base);
	return placeTestCases([
		...placeHeadCases(headCases, baseCases, patchAddedLines(patch), removed),
		...placeRemovedCases(path, headCases, baseCases, toHead),
	]);
}
