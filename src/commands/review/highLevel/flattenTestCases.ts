import type {
	HighLevelTestCase,
	HighLevelTestNode,
	HighLevelTestSuite,
} from "./types";

export type LocatedTestCase = {
	suites: HighLevelTestSuite[];
	test: HighLevelTestCase;
	fullName: string;
};

export function flattenTestCases(
	nodes: HighLevelTestNode[],
	suites: HighLevelTestSuite[] = [],
): LocatedTestCase[] {
	return nodes.flatMap((node) =>
		node.kind === "describe"
			? flattenTestCases(node.children, [...suites, node])
			: [
					{
						suites,
						test: node,
						fullName: JSON.stringify([
							...suites.map((suite) => suite.name),
							node.name,
						]),
					},
				],
	);
}
