import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";

export type Spawn = (create: (id: string) => Session) => string;

/** Restore one persisted session, logging (and surfacing as an error card) any
 * session that resumes into an error state or whose spawn throws (#396). */
export function restoreOne(
	persisted: PersistedSession,
	spawn: Spawn,
	sessions: Map<string, Session>,
): void {
	try {
		const id = spawn((sid) => restoreSession(sid, persisted));
		logUnresumable(persisted.name, id, sessions.get(id));
	} catch (error) {
		const reason = logRestoreError(persisted.name, error);
		spawn((id) => errorSession(id, persisted, reason));
	}
}

function logUnresumable(
	name: string,
	id: string,
	session: Session | undefined,
): void {
	if (session?.status === "error")
		daemonLog(
			`could not resume restored session "${name}" (id ${id}): ${session.error}`,
		);
}

function logRestoreError(name: string, error: unknown): string {
	const reason = error instanceof Error ? error.message : String(error);
	daemonLog(`failed to restore session "${name}": ${reason}`);
	return reason;
}
