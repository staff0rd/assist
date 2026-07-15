import type { Session } from "./createSession";
import type { PersistedSession } from "./persistedSessionSchema";

export function toPersistedSession(session: Session): PersistedSession {
	return {
		name: session.name,
		title: session.title,
		subtitle: session.subtitle,
		commandType: session.commandType,
		harness: session.harness,
		status: session.status,
		cwd: session.cwd ?? process.cwd(),
		startedAt: session.startedAt,
		runningMs: accumulatedRunningMs(session),
		claudeSessionId: session.claudeSessionId,
		initialPrompt: session.initialPrompt,
		runName: session.runName,
		runArgs: session.runArgs,
		assistArgs: session.assistArgs,
		activity: session.activity,
		starred: session.starred,
	};
}

/* why: persistence runs on every broadcast, while a session is still running and
 * its current stretch is not yet folded into runningMs. Fold the in-flight stretch
 * in here so the saved total is accurate at any moment; restore stamps a fresh
 * runningSince, so daemon-down time is never counted. */
function accumulatedRunningMs(session: Session): number {
	return session.runningSince != null
		? session.runningMs + Date.now() - session.runningSince
		: session.runningMs;
}
