import type { LocatedTestCase } from "./flattenTestCases";

export function countNames(cases: LocatedTestCase[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const { fullName } of cases)
		counts.set(fullName, (counts.get(fullName) ?? 0) + 1);
	return counts;
}
