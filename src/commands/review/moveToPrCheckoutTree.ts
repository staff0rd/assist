import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { allocateTree } from "../sessions/daemon/worktree/allocateTree";
import { persistedTreeRoots } from "../sessions/daemon/worktree/persistedTreeRoots";
import { installFailureMessage } from "../sessions/daemon/worktree/installFailureMessage";
import { seedWorktree } from "../sessions/daemon/worktree/seedWorktree";

function placedByDaemon(): boolean {
	return process.env.ASSIST_SESSION === "1";
}

function seed(worktreePath: string, clone: string): Promise<void> {
	console.log(`Preparing ${worktreePath}…`);
	return new Promise<void>((resolve) =>
		seedWorktree(worktreePath, clone, (outcome) => {
			if (!outcome.ok)
				console.warn(installFailureMessage(worktreePath, outcome));
			resolve();
		}),
	);
}

export async function moveToPrCheckoutTree(): Promise<void> {
	if (placedByDaemon()) return;
	const from = process.cwd();
	const alloc = allocateTree(from, persistedTreeRoots());
	if (!alloc.cwd || alloc.cwd === from) return;
	await alloc.ready;
	process.chdir(alloc.cwd);
	console.log(`Checking the PR out in ${alloc.cwd}`);
	appendDaemonLog(`pr checkout placed in ${alloc.cwd} (invoked from ${from})`);
	if (alloc.created && alloc.clone) await seed(alloc.cwd, alloc.clone);
}
