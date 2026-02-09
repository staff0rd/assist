import path from "node:path";
import type { ImportGraph } from "./types";

function findRootParent(
	file: string,
	importedBy: Map<string, Set<string>>,
	visited: Set<string>,
): string | undefined {
	const importers = importedBy.get(file);
	if (!importers || importers.size !== 1) return file;

	const parent = [...importers][0];
	const parentDir = path.dirname(parent);
	const fileDir = path.dirname(file);
	if (parentDir !== fileDir) return file;
	if (path.basename(parent, path.extname(parent)) === "index") return file;
	if (visited.has(parent)) return file;

	visited.add(parent);
	return findRootParent(parent, importedBy, visited);
}

export function clusterFiles(graph: ImportGraph): Map<string, string[]> {
	const clusters = new Map<string, string[]>();

	for (const file of graph.files) {
		const basename = path.basename(file, path.extname(file));
		if (basename === "index") continue;

		const importers = graph.importedBy.get(file);
		if (!importers || importers.size !== 1) continue;

		const parent = [...importers][0];
		if (!graph.files.has(parent)) continue;

		const parentDir = path.dirname(parent);
		const fileDir = path.dirname(file);
		if (parentDir !== fileDir) continue;

		const parentBasename = path.basename(parent, path.extname(parent));
		if (parentBasename === "index") continue;

		const root = findRootParent(parent, graph.importedBy, new Set([file]));
		if (!root || root === file) continue;

		const cluster = clusters.get(root) ?? [];
		if (!clusters.has(root)) clusters.set(root, cluster);
		cluster.push(file);
	}

	return clusters;
}
