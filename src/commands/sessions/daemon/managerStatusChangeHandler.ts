import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import { reuseSessionForRun } from "./reuseSessionForRun";
import type { OnStatusChange } from "./types";
import { restartManagedSession } from "./restartManagedSession";
import { escalateDivergence } from "./worktree/escalateDivergence";
import { resumeWatcherAfterEscalation } from "./worktree/resumeWatcherAfterEscalation";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function managerStatusChangeHandler(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	dismiss: (id: string) => void,
	notify: () => void,
	treeCtx: () => TreeSpawnContext,
): OnStatusChange {
	const handler: OnStatusChange = makeStatusChangeHandler(sessions, {
		dismiss,
		notify,
		reuseForRun: (session, itemId) =>
			reuseSessionForRun(session, itemId, clients, handler, treeCtx()),
		escalateDivergence: (watcher) => escalateDivergence(treeCtx(), watcher),
		resumeWatcher: (escalation) =>
			resumeWatcherAfterEscalation(sessions, escalation, (watcherId) => {
				if (restartManagedSession(sessions, watcherId, clients, handler).ok)
					notify();
			}),
	});
	return handler;
}
