import { findTsConfig } from "../extract/findTsConfig";
import { buildImportGraph } from "./buildImportGraph";
import { computeRewrites } from "./computeRewrites";
import { planRestructure } from "./planRestructure";
import type { RestructurePlan } from "./types";

export function buildPlan(scopeRoot: string, files: string[]): RestructurePlan {
	const graph = buildImportGraph(new Set(files), findTsConfig(files[0]));
	const { targets, moves, errors } = planRestructure({
		scopeRoot,
		files,
		edges: graph.edges,
	});
	const allProjectFiles = new Set([
		...graph.importedBy.keys(),
		...graph.imports.keys(),
	]);
	const rewrites = computeRewrites(moves, graph.edges, allProjectFiles);
	return { scopeRoot, targets, moves, rewrites, errors };
}
