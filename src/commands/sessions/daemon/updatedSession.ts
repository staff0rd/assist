import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";

/** A restored `assist update` session. Its final step restarts the daemon
 * (restartDaemonAfterUpdate), so reaching restore means the update already
 * succeeded — surface it as a cleanly completed card with no pty and no
 * "not restored" warning, rather than the retryable done stub the client
 * renders as "not restored" / "Starting session…" (#420). */
export function updatedSession(
	id: string,
	persisted: PersistedSession,
): Session {
	return {
		...restoreBase(id, persisted),
		status: "done",
		startedAt: persisted.startedAt,
		pty: null,
	};
}

export function isUpdate(persisted: PersistedSession): boolean {
	return (
		persisted.commandType === "assist" && persisted.assistArgs?.[0] === "update"
	);
}
