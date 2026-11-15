import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { daemonLog } from "../daemonLog";
import { canonicalTreePath } from "./canonicalTreePath";
import { createWorktree } from "./createWorktree";
import { keptInTree } from "./keptInTree";
import { mainWorktree } from "./listWorktreePaths";
import { worktreeConfigFor } from "./worktreeConfigFor";

export type Allocation = {
	cwd: string | undefined;
	kind: "primary" | "worktree";
	created: boolean;
	clone?: string;
	ready?: Promise<void>;
};

export type AllocateOptions = {
	inPlace?: boolean;
	replacesTree?: string;
	startPoint?: string;
};

export function allocateTree(
	requestedCwd: string | undefined,
	boundTreeRoots: Set<string>,
	options: AllocateOptions = {},
): Allocation {
	if (!requestedCwd)
		return { cwd: requestedCwd, kind: "primary", created: false };
	if (options.inPlace === true)
		return keptInTree(
			requestedCwd,
			"launched against work already checked out there",
		);
	const repoRoot = canonicalTreePath(
		findRepoRoot(requestedCwd) ?? requestedCwd,
	);
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled)
		return keptInTree(
			requestedCwd,
			`worktree.enabled is off for ${repoRoot}, so every session shares this tree`,
		);

	const clone = canonicalTreePath(mainWorktree(repoRoot) ?? repoRoot);
	const { path, ready } = createWorktree(
		clone,
		{ root: cfg.root, trunk: cfg.trunk, startPoint: options.startPoint },
		boundTreeRoots,
		options.replacesTree,
	);
	daemonLog(
		`session spilled out of the clone ${clone} into ${path}: worktree.enabled is on, so every session gets its own worktree`,
	);
	return { cwd: path, kind: "worktree", created: true, clone, ready };
}
