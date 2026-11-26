import type { HighLevelRegroupedNode, HighLevelTestCase } from "./types";

type FileScope = {
	path: string;
	cases: Map<string, HighLevelTestCase>;
	placed: Set<string>;
	warnings: string[];
};

export function resolveRegroupedNodes(
	nodes: HighLevelRegroupedNode[],
	scope: FileScope,
): HighLevelRegroupedNode[] {
	return nodes.flatMap((node): HighLevelRegroupedNode[] => {
		if ("describe" in node) {
			const children = resolveRegroupedNodes(node.children, scope);
			return children.length > 0 ? [{ describe: node.describe, children }] : [];
		}
		if (!scope.cases.has(node.id)) {
			scope.warnings.push(
				`Dropped unknown test ${node.id} from the regrouping of ${scope.path}.`,
			);
			return [];
		}
		if (scope.placed.has(node.id)) {
			scope.warnings.push(
				`Dropped repeat of test ${node.id} from the regrouping of ${scope.path}.`,
			);
			return [];
		}
		scope.placed.add(node.id);
		return [{ id: node.id, it: claimName(node.it) }];
	});
}

function claimName(it: string): string {
	return it.replace(/^it\s+/i, "");
}
