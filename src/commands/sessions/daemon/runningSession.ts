import type { Session, SessionStatus } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";

type RestoreBase = ReturnType<typeof restoreBase>;

export function runningSession(
	base: RestoreBase,
	persisted: PersistedSession,
	pty: Session["pty"],
): Session {
	return restoredSession(base, persisted, pty, "running");
}

export function waitingSession(
	base: RestoreBase,
	persisted: PersistedSession,
	pty: Session["pty"],
): Session {
	return restoredSession(base, persisted, pty, "waiting");
}

export function stoppedSession(
	base: RestoreBase,
	persisted: PersistedSession,
): Session {
	return {
		...restoredSession(base, persisted, null, "stopped"),
		undurable: persisted.undurable,
	};
}

export function parkedSession(
	base: RestoreBase,
	persisted: PersistedSession,
): Session {
	return restoredSession(base, persisted, null, "parked");
}

function restoredSession(
	base: RestoreBase,
	persisted: PersistedSession,
	pty: Session["pty"],
	status: SessionStatus,
): Session {
	const startedAt = Date.now();
	return {
		...base,
		status,
		startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: status === "running" ? startedAt : null,
		waitingSince: status === "waiting" ? startedAt : null,
		pty,
		claudeSessionId: persisted.claudeSessionId,
		restored: true,
		activity: persisted.activity,
	};
}
