import { countNames } from "./countNames";
import type { LocatedTestCase } from "./flattenTestCases";
import type { PlacedTestCase } from "./placeTestCases";

function takeName(counts: Map<string, number>, fullName: string): boolean {
	const count = counts.get(fullName) ?? 0;
	if (count === 0) return false;
	counts.set(fullName, count - 1);
	return true;
}

export function placeRemovedCases(
	path: string,
	headCases: LocatedTestCase[],
	baseCases: LocatedTestCase[],
	toHead: (line: number) => number,
): PlacedTestCase[] {
	const headCounts = countNames(headCases);
	return baseCases
		.filter((located) => !takeName(headCounts, located.fullName))
		.map(({ suites, test }) => ({
			suites: suites.map(({ name, line }) => ({
				name,
				line,
				position: toHead(line),
			})),
			test: { ...test, id: `${path}:base:${test.line}`, change: "removed" },
			position: toHead(test.line),
			fromBase: true,
		}));
}
