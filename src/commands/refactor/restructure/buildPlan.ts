import path from "node:path";
import { findTsConfig } from "../extract/findTsConfig";
import { buildImportGraph } from "./buildImportGraph";
import { computeRewrites } from "./computeRewrites";
import { planRestructure } from "./planRestructure";
import { moduleStem } from "./planRestructure/moduleStem";
import type { FileMove, RestructurePlan } from "./types";

function moduleKey(file: string): string {
	return path.join(path.dirname(file), moduleStem(file));
}

function findIgnoredOccupants(
	moves: FileMove[],
	ignored: string[],
	scopeRoot: string,
): string[] {
	const occupants = new Map(ignored.map((f) => [moduleKey(f), f]));
	return moves.flatMap((move) => {
		const occupant = occupants.get(moduleKey(move.to));
		if (!occupant) return [];
		const rel = (f: string) => path.relative(scopeRoot, f);
		return [
			`Target of ${rel(move.from)} is occupied by ignored file ${rel(occupant)}`,
		];
	});
}

export function buildPlan(
	scopeRoot: string,
	files: string[],
	ignored: string[] = [],
): RestructurePlan {
	const graph = buildImportGraph(new Set(files), findTsConfig(files[0]), {
		includeMocks: true,
	});
	const { targets, moves, errors } = planRestructure({
		scopeRoot,
		files,
		edges: graph.edges.filter((e) => !e.mock),
	});
	const allProjectFiles = new Set([
		...graph.importedBy.keys(),
		...graph.imports.keys(),
	]);
	const rewrites = computeRewrites(moves, graph.edges, allProjectFiles);
	return {
		scopeRoot,
		targets,
		moves,
		rewrites,
		errors: [...errors, ...findIgnoredOccupants(moves, ignored, scopeRoot)],
	};
}
