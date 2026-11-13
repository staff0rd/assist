import { daemonLog } from "../daemonLog";
import { git, gitOrNull } from "./git";
import { listLocalBranches } from "./listWorktreePaths";

export async function deleteWorktreeBranch(
	clone: string,
	branch: string,
): Promise<void> {
	if (!listLocalBranches(clone).includes(branch)) return;
	const current = await gitOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
	if (branch === current) return;
	try {
		await git(clone, ["branch", "-D", branch]);
		daemonLog(`worktree branch ${branch} deleted from clone ${clone}`);
	} catch (error) {
		daemonLog(
			`worktree branch ${branch} retained in clone ${clone}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
