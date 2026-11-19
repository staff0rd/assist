import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { canonicalTreePath } from "./canonicalTreePath";
import { mainWorktree } from "./listWorktreePaths";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function detectExistingWorktree(
	cwd: string,
): { path: string; clone: string } | undefined {
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	if (!worktreeConfigFor(repoRoot).enabled) return undefined;
	const main = mainWorktree(repoRoot);
	if (!main) return undefined;
	const clone = canonicalTreePath(main);
	if (clone !== canonicalTreePath(repoRoot)) return { path: repoRoot, clone };
	return undefined;
}
