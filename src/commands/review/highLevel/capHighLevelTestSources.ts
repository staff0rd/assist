import type {
	HighLevelTestCase,
	HighLevelTestFile,
	HighLevelTestNode,
} from "./types";

const MAX_TEST_SOURCE_LINES = 200;
const MAX_TOTAL_SOURCE_LINES = 5000;

export function capHighLevelTestSources(
	files: HighLevelTestFile[],
): HighLevelTestFile[] {
	let remaining = MAX_TOTAL_SOURCE_LINES;

	const capCase = (test: HighLevelTestCase): HighLevelTestCase => {
		if (test.source === undefined) return test;
		const lines = test.source.split("\n").length;
		if (lines <= Math.min(MAX_TEST_SOURCE_LINES, remaining)) {
			remaining -= lines;
			return test;
		}
		const { source: _dropped, ...rest } = test;
		return { ...rest, truncated: true };
	};

	const capNode = (node: HighLevelTestNode): HighLevelTestNode =>
		node.kind === "it"
			? capCase(node)
			: { ...node, children: node.children.map(capNode) };

	return files.map((file) => ({ ...file, tests: file.tests.map(capNode) }));
}
