import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { deferredSession } from "./deferredSession";
import { describePersistedSession } from "./describePersistedSession";
import { dropUnrestorableSessions } from "./dropUnrestorableSessions";
import {
	loadPersistedSessions,
	type PersistedSession,
} from "./loadPersistedSessions";
import { logDroppedSession } from "./logDroppedSession";
import type { SessionSpawner } from "./makeSessionSpawner";
import { remapLaunchedFrom } from "./remapLaunchedFrom";
import { restoreOne, type Spawn } from "./restoreOne";
import { sessionLimits } from "./sessionLimits";

export function restoreAll(
	spawner: SessionSpawner,
	sessions: Map<string, Session>,
): string[] {
	const persisted = dropUnrestorableSessions(loadPersistedSessions());
	const cap = sessionLimits.maxRestore();
	const restoredIds = new Map<string, string>();
	const names = persisted.slice(0, cap).map((entry) => {
		const id = restoreOne(entry, spawner, sessions);
		if (entry.id != null && id != null) restoredIds.set(entry.id, id);
		return entry.name;
	});
	for (const over of persisted.slice(cap))
		deferOne(over, spawner.recoveryCard, cap);
	remapLaunchedFrom(sessions, restoredIds);
	return names;
}

function deferOne(
	persisted: PersistedSession,
	spawnRecoveryCard: Spawn,
	cap: number,
): void {
	try {
		const id = spawnRecoveryCard((sid) => deferredSession(sid, persisted, cap));
		daemonLog(
			`restore capped at ${cap} (sessions.maxLive): ${describePersistedSession(persisted)} deferred to stopped card ${id}`,
		);
	} catch (error) {
		logDroppedSession(persisted, error);
	}
}
