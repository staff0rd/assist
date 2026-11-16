import { resolve } from "node:path";
import { daemonLog } from "../daemonLog";
import { enclosingPaths } from "./enclosingPaths";
import { type PathState, pendingPathAction } from "./pendingPathAction";
import type { InstallFailure, SeedOutcome } from "./SeedOutcome";
import { startPathInstall } from "./startPathInstall";
import { pathFailure } from "./pathFailure";
import { pathsProgress } from "./pathsProgress";

export function installPaths(
	worktreePath: string,
	paths: string[],
	onSeeded: (outcome: SeedOutcome) => void,
	onInstalling: (path?: string) => void,
): void {
	const dirs = paths.map((rel) => resolve(worktreePath, rel));
	const enclosing = enclosingPaths(dirs);
	const states: PathState[] = paths.map(() => "pending");
	const failures: (InstallFailure | undefined)[] = paths.map(() => undefined);
	let stopped = false;
	let seeded = false;

	const pump = (): void => {
		for (let i = 0; i < paths.length; i++) {
			if (states[i] !== "pending") continue;
			const action = pendingPathAction(enclosing[i], states, paths, stopped);
			if (action.kind === "start") {
				states[i] = "running";
				startPathInstall(worktreePath, paths[i], dirs[i], (outcome) => {
					states[i] = outcome.ok ? "ok" : "failed";
					failures[i] = pathFailure(paths[i], outcome);
					stopped ||= !outcome.ok && outcome.stopped;
					pump();
				});
			}
			if (action.kind !== "skip") continue;
			states[i] = "skipped";
			daemonLog(
				`worktree ${worktreePath} install skipping ${paths[i]}: ${action.reason}`,
			);
		}
		const outcome = pathsProgress(paths, states, failures, onInstalling);
		if (outcome && !seeded) {
			seeded = true;
			onSeeded(outcome);
		}
	};

	pump();
}
