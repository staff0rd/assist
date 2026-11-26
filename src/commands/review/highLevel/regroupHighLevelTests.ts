import { flattenTestCases } from "./flattenTestCases";
import type {
	HighLevelRegroupedNode,
	HighLevelTestCase,
	HighLevelTestFile,
	HighLevelTestNode,
	HighLevelTestRegrouping,
} from "./types";

function toNodes(
	nodes: HighLevelRegroupedNode[],
	cases: Map<string, HighLevelTestCase>,
	ungrouped = false,
): HighLevelTestNode[] {
	return nodes.flatMap((node, index): HighLevelTestNode[] => {
		if ("describe" in node) {
			const children = toNodes(node.children, cases, node.ungrouped ?? false);
			if (children.length === 0) return [];
			return [
				{
					kind: "describe",
					name: node.describe,
					line: index,
					children,
					...(node.ungrouped ? { ungrouped: true } : {}),
				},
			];
		}
		const test = cases.get(node.id);
		if (!test) return [];
		cases.delete(node.id);
		return [
			ungrouped ? test : { ...test, name: node.it, writtenName: test.name },
		];
	});
}

function regroupFile(
	file: HighLevelTestFile,
	regrouping: HighLevelRegroupedNode[],
): HighLevelTestFile {
	const cases = new Map(
		flattenTestCases(file.tests).map(({ test }) => [test.id, test]),
	);
	const tests = toNodes(regrouping, cases);
	const left = [...cases.values()];
	if (left.length > 0)
		tests.push({
			kind: "describe",
			name: "Ungrouped",
			line: tests.length,
			children: left,
			ungrouped: true,
		});
	return { ...file, tests };
}

export function regroupHighLevelTests(
	files: HighLevelTestFile[],
	regrouping: HighLevelTestRegrouping,
): HighLevelTestFile[] {
	return files.map((file) => regroupFile(file, regrouping[file.path] ?? []));
}
