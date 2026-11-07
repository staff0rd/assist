import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { describePersistedSession } from "./describePersistedSession";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { logDroppedSession } from "./logDroppedSession";
import type { SessionSpawner } from "./makeSessionSpawner";
import { restoreSession } from "./restoreSession";

export type Spawn = (create: (id: string) => Session) => string;

/** Restore one persisted session, logging (and surfacing as an error card) any
 * session that resumes into an error state or whose spawn throws (#396). */
export function restoreOne(
	persisted: PersistedSession,
	spawner: SessionSpawner,
	sessions: Map<string, Session>,
): string | undefined {
	try {
		const id = spawner.spawn((sid) => restoreSession(sid, persisted));
		if (persisted.status === "error")
			daemonLog(
				`restored errored session "${persisted.name}" (id ${id}) as its error card; restart resumes ${persisted.claudeSessionId ?? persisted.harnessSessionId ?? "fresh"}`,
			);
		else logUnresumable(persisted.name, id, sessions.get(id));
		return id;
	} catch (error) {
		const reason = logRestoreError(persisted, error);
		spawnErrorCard(persisted, spawner, reason);
		return undefined;
	}
}

function spawnErrorCard(
	persisted: PersistedSession,
	spawner: SessionSpawner,
	reason: string,
): void {
	try {
		spawner.recoveryCard((id) => errorSession(id, persisted, reason));
	} catch (cardError) {
		logDroppedSession(persisted, cardError);
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

function logRestoreError(persisted: PersistedSession, error: unknown): string {
	const reason = error instanceof Error ? error.message : String(error);
	daemonLog(
		`failed to restore session ${describePersistedSession(persisted)}: ${reason}`,
	);
	return reason;
}
