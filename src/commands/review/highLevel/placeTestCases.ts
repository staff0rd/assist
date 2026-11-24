import type { HighLevelTestCase, HighLevelTestNode } from "./types";

type PlacedSuite = { name: string; line: number; position: number };

export type PlacedTestCase = {
	suites: PlacedSuite[];
	test: HighLevelTestCase;
	position: number;
	fromBase: boolean;
};

type Draft = {
	position: number;
	fromBase: boolean;
	node: HighLevelTestCase | DraftSuite;
};

type DraftSuite = {
	kind: "describe";
	name: string;
	line: number;
	children: Draft[];
};

function suiteDraft(
	level: Draft[],
	suite: PlacedSuite,
	fromBase: boolean,
): DraftSuite {
	const existing = level.find(
		(draft) =>
			draft.node.kind === "describe" &&
			draft.node.name === suite.name &&
			(fromBase || (!draft.fromBase && draft.node.line === suite.line)),
	);
	if (existing?.node.kind === "describe") return existing.node;
	const node: DraftSuite = {
		kind: "describe",
		name: suite.name,
		line: suite.line,
		children: [],
	};
	level.push({ position: suite.position, fromBase, node });
	return node;
}

function place(root: Draft[], placed: PlacedTestCase): void {
	let level = root;
	for (const suite of placed.suites)
		level = suiteDraft(level, suite, placed.fromBase).children;
	level.push({
		position: placed.position,
		fromBase: placed.fromBase,
		node: placed.test,
	});
}

function toNodes(drafts: Draft[]): HighLevelTestNode[] {
	return [...drafts]
		.sort(
			(a, b) =>
				a.position - b.position || Number(b.fromBase) - Number(a.fromBase),
		)
		.map(({ node }) =>
			node.kind === "it" ? node : { ...node, children: toNodes(node.children) },
		);
}

export function placeTestCases(placed: PlacedTestCase[]): HighLevelTestNode[] {
	const root: Draft[] = [];
	for (const entry of [...placed].sort(
		(a, b) => Number(a.fromBase) - Number(b.fromBase),
	))
		place(root, entry);
	return toNodes(root);
}
