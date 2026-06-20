import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";

type RestoreBase = ReturnType<typeof restoreBase>;

export function runningSession(
	base: RestoreBase,
	persisted: PersistedSession,
	pty: Session["pty"],
): Session {
	const startedAt = Date.now();
	return {
		...base,
		status: "running",
		startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: startedAt,
		pty,
		claudeSessionId: persisted.claudeSessionId,
		restored: true,
		activity: persisted.activity,
	};
}
