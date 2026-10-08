import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { daemonLog } from "../daemonLog";
import { canonicalTreePath } from "./canonicalTreePath";
import { createWorktree } from "./createWorktree";
import { keptInTree } from "./keptInTree";
import { mainWorktree } from "./listWorktreePaths";
import { reusesClone } from "./reusesClone";
import { worktreeConfigFor } from "./worktreeConfigFor";
import { forcedSpillReason } from "./forcedSpillReason";

export type Allocation = {
	cwd: string | undefined;
	kind: "primary" | "worktree";
	created: boolean;
	clone?: string;
};

export type AllocateOptions = {
	forCheckout?: boolean;
	assistCommand?: string;
	inPlace?: boolean;
	commits?: boolean;
	backlogRun?: boolean;
	replacesTree?: string;
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
	const forcedSpill = forcedSpillReason(clone, cfg.trunk, options);
	if (forcedSpill) daemonLog(forcedSpill);
	else if (reusesClone(clone, boundTreeRoots, options))
		return { cwd: clone, kind: "primary", created: false, clone };

	const path = createWorktree(
		clone,
		{ root: cfg.root, trunk: cfg.trunk },
		boundTreeRoots,
		options.replacesTree,
	);
	return { cwd: path, kind: "worktree", created: true, clone };
}
