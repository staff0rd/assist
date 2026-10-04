import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import { reuseSessionForRun } from "./reuseSessionForRun";
import type { OnStatusChange } from "./types";
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
	});
	return handler;
}
