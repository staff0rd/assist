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
		scrollback: `\r\n\x1b[31m${error}\x1b[0m\r\n`,
		status: "error",
		startedAt: persisted.startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		claudeSessionId: persisted.claudeSessionId,
		activity: persisted.activity,
		error,
		restored: false,
	};
}
