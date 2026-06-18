import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";

/** A restored session that could not be resumed: no pty, surfaced as an error
 * so the card shows a failure state instead of hanging at "Starting…" (#396). */
export function errorSession(
	id: string,
	persisted: PersistedSession,
	error: string,
): Session {
	return {
		...restoreBase(id, persisted),
		status: "error",
		startedAt: persisted.startedAt,
		pty: null,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		error,
		restored: false,
	};
}
