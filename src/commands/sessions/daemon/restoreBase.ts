import type { PersistedSession } from "./loadPersistedSessions";

export function restoreBase(id: string, persisted: PersistedSession) {
	return {
		id,
		name: persisted.name,
		commandType: persisted.commandType,
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		cwd: persisted.cwd,
		assistArgs: persisted.assistArgs,
	};
}
