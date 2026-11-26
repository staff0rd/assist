import { flattenTestCases } from "./flattenTestCases";
import type {
	HighLevelRegroupedNode,
	HighLevelTestFile,
	HighLevelTestRegrouping,
} from "./types";
import { resolveRegroupedNodes } from "./resolveRegroupedNodes";

function resolveFile(
	file: HighLevelTestFile,
	input: HighLevelRegroupedNode[],
	warnings: string[],
): HighLevelRegroupedNode[] {
	const cases = new Map(
		flattenTestCases(file.tests).map(({ test }) => [test.id, test]),
	);
	const scope = { path: file.path, cases, placed: new Set<string>(), warnings };
	const nodes = resolveRegroupedNodes(input, scope);
	const ungrouped = [...cases.values()].filter(
		(test) => !scope.placed.has(test.id),
	);
	if (ungrouped.length === 0) return nodes;
	return [
		...nodes,
		{
			describe: "Ungrouped",
			ungrouped: true,
			children: ungrouped.map((test) => ({ id: test.id, it: test.name })),
		},
	];
}

export function resolveHighLevelTestRegrouping(
	input: HighLevelTestRegrouping,
	tests: HighLevelTestFile[],
	warnings: string[],
): HighLevelTestRegrouping {
	const paths = new Set(tests.map((file) => file.path));
	for (const path of Object.keys(input))
		if (!paths.has(path))
			warnings.push(
				`Dropped the regrouping of ${path}: it has no changed tests.`,
			);
	return Object.fromEntries(
		tests.map((file) => [
			file.path,
			resolveFile(file, input[file.path] ?? [], warnings),
		]),
	);
}
