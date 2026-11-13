import { existsSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import { git } from "./git";
import { listLocalBranches } from "./listWorktreePaths";
import { forgetWorktree } from "./readWorktreeRegistry";
import { removeBindMountContainers } from "./removeBindMountContainers";

export async function reclaimVanishedWorktrees(
	clone: string,
	paths: { path: string; branch: string }[],
): Promise<void> {
	for (const { path } of paths) await removeBindMountContainers(path);
	if (!existsSync(clone)) {
		for (const { path } of paths) forgetWorktree(path);
		daemonLog(
			`clone ${clone} is gone; forgot ${paths.length} worktree record(s) it owned`,
		);
		return;
	}
	await pruneBookkeeping(clone);
	for (const { path, branch } of paths)
		if (await reclaimBranch(clone, branch)) forgetWorktree(path);
}

async function pruneBookkeeping(clone: string): Promise<void> {
	try {
		await git(clone, ["worktree", "prune"]);
		daemonLog(`worktree bookkeeping pruned for clone ${clone}`);
	} catch (error) {
		daemonLog(
			`worktree bookkeeping prune failed for clone ${clone}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function reclaimBranch(clone: string, branch: string): Promise<boolean> {
	if (!listLocalBranches(clone).includes(branch)) return true;
	try {
		await git(clone, ["branch", "-d", branch]);
		daemonLog(`stale worktree branch ${branch} pruned from clone ${clone}`);
		return true;
	} catch {
		daemonLog(
			`stale worktree branch ${branch} retained (unmerged; surfaced not destroyed) in clone ${clone}`,
		);
		return false;
	}
}
