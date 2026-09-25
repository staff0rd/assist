import path from "node:path";
import type { FileMove } from "./types";
import { collectAnchors } from "./planRestructure/collectAnchors";
import { findCollisions } from "./planRestructure/findCollisions";
import { indexEdges } from "./planRestructure/indexEdges";
import { placeComponents } from "./planRestructure/placeComponents";
import type { PlannerInput, PlannerResult } from "./planRestructure/types";

/** Target paths depend only on the import graph and scope root, never on where files currently sit. */
export function planRestructure(input: PlannerInput): PlannerResult {
	const scopeRoot = path.resolve(input.scopeRoot);
	const files = [...new Set(input.files)].sort();
	const index = indexEdges(new Set(files), input.edges);
	const anchorings = collectAnchors(files, index);
	const placements = placeComponents(files, anchorings, scopeRoot);

	const targets = new Map<string, string>();
	const moves: FileMove[] = [];
	for (const file of files) {
		const { dir, reason } = placements.get(file) as {
			dir: string;
			reason: string;
		};
		const to = path.join(dir, path.basename(file));
		targets.set(file, to);
		if (to !== file) moves.push({ from: file, to, reason });
	}
	return { targets, moves, errors: findCollisions(targets, scopeRoot) };
}
