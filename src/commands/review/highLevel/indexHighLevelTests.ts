import type { HighLevelTestFile, HighLevelTestNode } from "./types";

type IndexedTest = { path: string; line: number; title: string[] };

export function indexHighLevelTests(
	files: HighLevelTestFile[],
): Map<string, IndexedTest> {
	const index = new Map<string, IndexedTest>();
	const walk = (path: string, node: HighLevelTestNode, parents: string[]) => {
		const title = [...parents, node.name];
		if (node.kind === "it")
			index.set(node.id, { path, line: node.line, title });
		else for (const child of node.children) walk(path, child, title);
	};
	for (const file of files)
		for (const node of file.tests) walk(file.path, node, []);
	return index;
}
