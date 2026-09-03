import type { Session } from "./createSession";
import type { PersistedSession } from "./persistedSessionSchema";

export function toPersistedSession(session: Session): PersistedSession {
	return {
		id: session.id,
		name: session.name,
		title: session.title,
		generatedTitle: session.generatedTitle,
		subtitle: session.subtitle,
		commandType: session.commandType,
		harness: session.harness,
		status: session.status,
		cwd: session.cwd ?? process.cwd(),
		startedAt: session.startedAt,
		runningMs: accumulatedRunningMs(session),
		claudeSessionId: session.claudeSessionId,
		harnessSessionId: session.harnessSessionId,
		initialPrompt: session.initialPrompt,
		runName: session.runName,
		runArgs: session.runArgs,
		assistArgs: session.assistArgs,
		activity: session.activity,
		starred: session.starred,
		watcher: session.watcher,
		design: session.design,
		auto: session.auto,
		autoRun: session.autoRun,
		autoAdvance: session.autoAdvance,
		reviewStarted: session.reviewStarted,
		launchedFrom: session.launchedFrom,
		interrupted: session.interrupted,
		undurable: session.undurable,
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
