import type { LocatedTestCase } from "./flattenTestCases";
import type { HighLevelTestCase } from "./types";

export function headCase(
	located: LocatedTestCase,
	matched: LocatedTestCase | undefined,
	added: Set<number>,
	removed: Set<number>,
): HighLevelTestCase | undefined {
	const { test } = located;
	if (!matched) return { ...test, change: "added" };
	const changedLines = linesOf(test).filter((line) => added.has(line));
	const lostLines = linesOf(matched.test).some((line) => removed.has(line));
	if (changedLines.length === 0 && !lostLines) return undefined;
	return {
		...test,
		change: "modified",
		...(changedLines.length > 0 ? { changedLines } : {}),
	};
}

function linesOf(test: HighLevelTestCase): number[] {
	const count = (test.source ?? "").split("\n").length;
	return Array.from({ length: count }, (_, i) => test.line + i);
}
