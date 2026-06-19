import type { Session } from "./createSession";
import { loadPersistedSessions } from "./loadPersistedSessions";
import { restoreOne, type Spawn } from "./restoreOne";

export function restoreAll(
	spawn: Spawn,
	sessions: Map<string, Session>,
): string[] {
	return loadPersistedSessions().map((persisted) => {
		restoreOne(persisted, spawn, sessions);
		return persisted.name;
	});
}
