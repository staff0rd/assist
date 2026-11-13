import path from "node:path";
import { moduleSpecifiers } from "./moduleSpecifiers";
import { resolveRelative } from "./resolveRelative";

type ImportGraph = {
	modules: Set<string>;
	packages: Map<string, string>;
	lazyTargets: Map<string, string>;
};

function packageName(specifier: string): string {
	const parts = specifier.replace(/^node:/, "").split("/");
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function addImports(graph: ImportGraph, file: string, pending: string[]) {
	const { staticImports, dynamicImports } = moduleSpecifiers(file);
	for (const specifier of staticImports) {
		if (!specifier.startsWith(".")) {
			graph.packages.set(packageName(specifier), file);
			continue;
		}
		const resolved = resolveRelative(file, specifier);
		if (resolved) pending.push(resolved);
	}
	for (const specifier of dynamicImports) {
		const resolved = specifier.startsWith(".")
			? resolveRelative(file, specifier)
			: undefined;
		if (resolved) graph.lazyTargets.set(resolved, file);
	}
}

export function collectStaticImportGraph(entry: string): ImportGraph {
	const graph: ImportGraph = {
		modules: new Set(),
		packages: new Map(),
		lazyTargets: new Map(),
	};
	const pending = [path.resolve(entry)];
	while (pending.length > 0) {
		const file = pending.pop() as string;
		if (graph.modules.has(file)) continue;
		graph.modules.add(file);
		if (!file.endsWith(".json")) addImports(graph, file, pending);
	}
	return graph;
}
