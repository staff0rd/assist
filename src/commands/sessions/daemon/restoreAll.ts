import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { loadPersistedSessions } from "./loadPersistedSessions";
import { restoreOne, type Spawn } from "./restoreOne";
import { sessionLimits } from "./sessionLimits";

export function restoreAll(
	spawn: Spawn,
	sessions: Map<string, Session>,
): string[] {
	const persisted = loadPersistedSessions();
	const toRestore = persisted.slice(0, sessionLimits.maxRestore);
	const skipped = persisted.length - toRestore.length;
	if (skipped > 0)
		daemonLog(
			`restore capped at ${sessionLimits.maxRestore}; skipping ${skipped} persisted session(s)`,
		);
	return toRestore.map((persisted) => {
		restoreOne(persisted, spawn, sessions);
		return persisted.name;
	});
}
