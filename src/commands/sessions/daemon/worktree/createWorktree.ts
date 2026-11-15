import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { expandTilde } from "../../../../shared/expandTilde";
import { listLocalBranches, listWorktreePaths } from "./listWorktreePaths";
import { nextWorktreePath } from "./nextWorktreePath";
import { addWorktree } from "./addWorktree";

type CreatedWorktree = { path: string; ready: Promise<void> };

export function createWorktree(
	clone: string,
	strategy: { root: string | undefined; trunk: boolean; startPoint?: string },
	boundTreeRoots: Set<string>,
	preferredPath?: string,
): CreatedWorktree {
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
	const ready = addWorktree(clone, path, strategy.trunk, strategy.startPoint);
	ready.catch(() => {});
	return { path, ready };
}
