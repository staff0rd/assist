import type { LocatedTestCase } from "./flattenTestCases";
import { headCase } from "./headCase";
import type { PlacedTestCase } from "./placeTestCases";

function groupByName(cases: LocatedTestCase[]): Map<string, LocatedTestCase[]> {
	const groups = new Map<string, LocatedTestCase[]>();
	for (const located of cases)
		groups.set(located.fullName, [
			...(groups.get(located.fullName) ?? []),
			located,
		]);
	return groups;
}

export function placeHeadCases(
	headCases: LocatedTestCase[],
	baseCases: LocatedTestCase[],
	added: Set<number>,
	removed: Set<number>,
): PlacedTestCase[] {
	const unmatchedBase = groupByName(baseCases);
	return headCases.flatMap((located) => {
		const test = headCase(
			located,
			unmatchedBase.get(located.fullName)?.shift(),
			added,
			removed,
		);
		if (!test) return [];
		return [
			{
				suites: located.suites.map(({ name, line }) => ({
					name,
					line,
					position: line,
				})),
				test,
				position: test.line,
				fromBase: false,
			},
		];
	});
}
