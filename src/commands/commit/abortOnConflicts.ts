import { findConflictMarkers, findUnmergedPaths } from "./findConflictMarkers";

function abort(headline: string, guidance: string): never {
	console.error(`Error: refusing to commit — ${headline}`);
	console.error(guidance);
	console.error("Nothing was committed or pushed.");
	process.exit(1);
}

export function abortOnConflicts(files: string[], pulled: boolean): void {
	if (pulled) {
		const unmerged = findUnmergedPaths();
		if (unmerged.length > 0) {
			abort(
				`git pull --autostash left unresolved conflicts in: ${unmerged.join(", ")}`,
				"Your local changes are safe in the stash. Resolve the autostash conflict manually (edit the files, then `git stash drop`, or run `git stash pop`), then re-run the commit.",
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
