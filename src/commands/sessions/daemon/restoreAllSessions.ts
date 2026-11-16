import { awaitServerPort, type PortWaitDeps } from "./awaitServerPort";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import type { SessionSpawner } from "./makeSessionSpawner";
import { reopenDeferredCommands } from "./reopenDeferredCommands";
import { holdingWakes } from "./holdingWakes";
import { restoreAll } from "./restoreAll";
import { resumeDiscoveredConversations } from "./resumeDiscoveredConversations";
import { rearmStoppedSessions } from "./worktree/rearmStoppedSessions";
import { reconcileWorktreesOnRestore } from "./worktree/reconcileWorktreesOnRestore";
import { reseedRestoredWorktrees } from "./worktree/reseedRestoredWorktrees";

export function restoreAllSessions(
	spawner: SessionSpawner,
	deps: PortWaitDeps & Pick<DeferredDeliveryHost, "io">,
): string[] {
	const { sessions, notify } = deps;
	// why: a parked run is restored before its phase cards are and relinked to it, so it must not wake mid-restore.
	const names = holdingWakes(sessions, () => restoreAll(spawner, sessions));
	resumeDiscoveredConversations(deps);
	reopenDeferredCommands(sessions.values(), {
		session: (id) => sessions.get(id),
		io: deps.io,
	});
	reseedRestoredWorktrees(deps);
	reconcileWorktreesOnRestore(sessions, spawner.recoveryCard, notify);
	rearmStoppedSessions(sessions, notify);
	for (const session of sessions.values())
		if (session.server && session.serverPort && session.pendingStart)
			awaitServerPort(session, session.serverPort, deps);
	return names;
}
