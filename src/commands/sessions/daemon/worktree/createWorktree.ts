import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { expandTilde } from "../../../../shared/expandTilde";
import { getCurrentOrigin } from "../../../backlog/getCurrentOrigin";
import { fetchQuietly } from "../../../watch/fetchQuietly";
import { daemonLog } from "../daemonLog";
import { gitSync } from "./git";
import { listLocalBranches, listWorktreePaths } from "./listWorktreePaths";
import { nextWorktreePath } from "./planAllocation";
import { recordWorktree } from "./readWorktreeRegistry";
import { worktreeStartPoint } from "./worktreeStartPoint";

export function createWorktree(
	clone: string,
	strategy: { root: string | undefined; trunk: boolean },
	boundTreeRoots: Set<string>,
	preferredPath?: string,
): string {
	const base = strategy.root ? expandTilde(strategy.root) : dirname(clone);
	const registered = new Set(listWorktreePaths(clone));
	const branches = new Set(listLocalBranches(clone));
	const isTaken = (candidate: string) =>
		registered.has(candidate) ||
		existsSync(candidate) ||
		boundTreeRoots.has(candidate) ||
		branches.has(basename(candidate));
	const path =
		preferredPath && !isTaken(preferredPath)
			? preferredPath
			: nextWorktreePath(clone, base, isTaken);
	const fetchError = fetchQuietly(clone, 0);
	if (fetchError)
		daemonLog(
			`fetch before allocating a worktree for clone ${clone} failed, branching off local refs: ${fetchError}`,
		);
	const start = worktreeStartPoint(clone, strategy.trunk);
	gitSync(clone, [
		"worktree",
		"add",
		start.track ? "--track" : "--no-track",
		"-b",
		basename(path),
		path,
		start.ref,
	]);
	recordWorktree(path, clone, getCurrentOrigin(clone));
	daemonLog(
		start.track
			? `worktree allocated ${path} (branch ${basename(path)} tracking ${start.ref}) for clone ${clone}`
			: `worktree allocated ${path} (branch ${basename(path)} off ${start.ref}, no mainline tracking) for clone ${clone}`,
	);
	return path;
}
