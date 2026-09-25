import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { canonicalTreePath } from "./canonicalTreePath";
import { mainWorktree } from "./listWorktreePaths";

export function resolveClone(cwd: string): string {
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	return canonicalTreePath(mainWorktree(repoRoot) ?? repoRoot);
}
