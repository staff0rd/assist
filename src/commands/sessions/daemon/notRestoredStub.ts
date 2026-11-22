import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";

type RestoreBase = ReturnType<typeof restoreBase>;

export function notRestoredStub(
	base: RestoreBase,
	persisted: PersistedSession,
): Session {
	return {
		...base,
		status: "done",
		startedAt: persisted.startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		restored: false,
	};
}
