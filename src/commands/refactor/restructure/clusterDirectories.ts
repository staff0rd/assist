import path from "node:path";
import type { ImportGraph } from "./types";

export function clusterDirectories(graph: ImportGraph): Map<string, string[]> {
	const dirImportedBy = new Map<string, Set<string>>();

	for (const edge of graph.edges) {
		const sourceDir = path.dirname(edge.source);
		const targetDir = path.dirname(edge.target);
		if (sourceDir === targetDir) continue;
		if (!graph.files.has(edge.target)) continue;

		const existing = dirImportedBy.get(targetDir) ?? new Set<string>();
		if (!dirImportedBy.has(targetDir)) dirImportedBy.set(targetDir, existing);
		existing.add(sourceDir);
	}

	const clusters = new Map<string, string[]>();

	for (const [dir, importers] of dirImportedBy) {
		if (importers.size !== 1) continue;

		const parentDir = [...importers][0];
		if (isAncestor(dir, parentDir)) continue;
		if (isAncestor(parentDir, dir)) continue;

		const cluster = clusters.get(parentDir) ?? [];
		if (!clusters.has(parentDir)) clusters.set(parentDir, cluster);
		cluster.push(dir);
	}

	for (const [parentDir, children] of clusters) {
		const filtered = children.filter((child) => !clusters.has(child));
		if (filtered.length === 0) {
			clusters.delete(parentDir);
		} else {
			clusters.set(parentDir, filtered);
		}
	}

	return clusters;
}

function isAncestor(ancestor: string, descendant: string): boolean {
	const rel = path.relative(ancestor, descendant);
	return !rel.startsWith("..") && rel !== "";
}
