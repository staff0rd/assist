import { attachReusedRun } from "./attachReusedRun";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resetCardForRun } from "./resetCardForRun";
import { startReusedRunPty } from "./startReusedRunPty";
import type { OnStatusChange } from "./types";
import type { Allocation } from "./worktree/allocateTree";
import { isCommittingArgs } from "./worktree/isCommittingArgs";
import { planReuseTree } from "./worktree/planReuseTree";
import type { TreeSpawnContext } from "./worktree/spawnInTree";
import { failChainedRun } from "./failChainedRun";

export function reuseSessionForRun(
	session: Session,
	itemId: number,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	tree?: TreeSpawnContext,
): void {
	const assistArgs = ["backlog", "run", String(itemId)];
	resetCardForRun(session, assistArgs);
	let alloc: Allocation | undefined;
	try {
		alloc = planReuseTree(session, tree, {
			commits: isCommittingArgs(assistArgs),
			backlogRun: true,
		});
	} catch (error) {
		failChainedRun(session, itemId, error, clients, tree);
		return;
	}
	if (alloc) session.cwd = alloc.cwd;
	const started = startReusedRunPty(
		session,
		assistArgs,
		itemId,
		alloc !== undefined,
		clients,
		onStatusChange,
	);
	if (!started) return;
	attachReusedRun(session, alloc, clients, onStatusChange, tree);
	daemonLog(
		`session ${session.id} reused for backlog run ${itemId}: ${session.name}`,
	);
}
