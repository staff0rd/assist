import { findConflictMarkers, findUnmergedPaths } from "./findConflictMarkers";

function abort(headline: string, guidance: string): never {
	console.error(`Error: refusing to commit — ${headline}`);
	console.error(guidance);
	console.error("Nothing was committed or pushed.");
	process.exit(1);
}

export function abortOnConflicts(
	files: string[],
	pulled: boolean,
	merging = false,
): void {
	if (pulled || merging) {
		const unmerged = findUnmergedPaths();
		if (unmerged.length > 0) {
			const source = merging ? "the merge" : "git pull --autostash";
			abort(
				`${source} left unresolved conflicts in: ${unmerged.join(", ")}`,
				"Resolve the conflicts and stage them, then re-run the commit.",
			);
		}
	}
	const conflicted = findConflictMarkers(files);
	if (conflicted.length > 0) {
		abort(
			`merge-conflict markers found in: ${conflicted.join(", ")}`,
			"Resolve the conflict markers, then re-run the commit.",
		);
	}
}
