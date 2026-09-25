import { isTestFile } from "./isTestFile";
import type { PlannerEdge } from "./types";

export type EdgeIndex = {
	importers: Map<string, Set<string>>;
	testImporters: Map<string, Set<string>>;
	imports: Map<string, Set<string>>;
	external: Set<string>;
};

function add(map: Map<string, Set<string>>, key: string, value: string): void {
	const set = map.get(key) ?? new Set<string>();
	set.add(value);
	map.set(key, set);
}

export function indexEdges(
	scope: Set<string>,
	edges: PlannerEdge[],
): EdgeIndex {
	const index: EdgeIndex = {
		importers: new Map(),
		testImporters: new Map(),
		imports: new Map(),
		external: new Set(),
	};
	for (const { source, target } of edges) {
		if (!scope.has(target) || source === target) continue;
		const test = isTestFile(source);
		if (!scope.has(source)) {
			if (!test) index.external.add(target);
			continue;
		}
		add(index.imports, source, target);
		add(test ? index.testImporters : index.importers, target, source);
	}
	return index;
}
