import { daemonLog } from "../daemonLog";
import { git } from "./git";

export async function pruneBookkeeping(
	clone: string,
	worktreePath: string,
): Promise<void> {
	try {
		await git(clone, ["worktree", "prune"]);
		daemonLog(
			`worktree bookkeeping pruned in clone ${clone} after deleting ${worktreePath} directly`,
		);
	} catch (error) {
		daemonLog(
			`worktree bookkeeping prune failed in clone ${clone} after deleting ${worktreePath}: ${reason(error)}`,
		);
	}
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
