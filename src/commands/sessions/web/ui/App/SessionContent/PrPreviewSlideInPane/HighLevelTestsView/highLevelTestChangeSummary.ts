import type {
	HighLevelTestFile,
	HighLevelTestNode,
} from "../../../../../../../review/highLevel/types";

function changes(nodes: HighLevelTestNode[]): (string | undefined)[] {
	return nodes.flatMap((node) =>
		node.kind === "it" ? [node.change] : changes(node.children),
	);
}

export function highLevelTestChangeSummary(files: HighLevelTestFile[]): string {
	const all = changes(files.flatMap((file) => file.tests));
	const added = all.filter((change) => change === "added").length;
	const modified = all.filter((change) => change === "modified").length;
	const deleted = all.filter((change) => change === "removed").length;
	if (added + modified + deleted === 0)
		return `${all.length} test${all.length === 1 ? "" : "s"} in changed files`;
	return `${added} added · ${deleted} deleted · ${modified} modified · unchanged tests are not listed`;
}
