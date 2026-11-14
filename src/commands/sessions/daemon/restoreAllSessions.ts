import { awaitServerPort, type PortWaitDeps } from "./awaitServerPort";
import type { SessionSpawner } from "./makeSessionSpawner";
import { reopenDeferredCommands } from "./reopenDeferredCommands";
import { restoreAll } from "./restoreAll";
import { rearmStoppedSessions } from "./worktree/rearmStoppedSessions";
import { reconcileWorktreesOnRestore } from "./worktree/reconcileWorktreesOnRestore";
import { reseedRestoredWorktrees } from "./worktree/reseedRestoredWorktrees";

export function restoreAllSessions(
	spawner: SessionSpawner,
	deps: PortWaitDeps,
): string[] {
	const { sessions, notify } = deps;
	const names = restoreAll(spawner, sessions);
	reopenDeferredCommands(sessions.values(), {
		session: (id) => sessions.get(id),
	});
	reseedRestoredWorktrees(deps);
	reconcileWorktreesOnRestore(sessions, spawner.recoveryCard, notify);
	rearmStoppedSessions(sessions, notify);
	for (const session of sessions.values())
		if (session.server && session.serverPort && session.pendingStart)
			awaitServerPort(session, session.serverPort, deps);
	return names;
}
