import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";

type RestoreBase = ReturnType<typeof restoreBase>;

export function runningSession(
	base: RestoreBase,
	persisted: PersistedSession,
	pty: Session["pty"],
): Session {
	return {
		...base,
		status: "running",
		startedAt: Date.now(),
		pty,
		claudeSessionId: persisted.claudeSessionId,
		restored: true,
		activity: persisted.activity,
	};
}
