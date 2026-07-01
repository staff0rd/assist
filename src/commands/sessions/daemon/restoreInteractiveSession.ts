import { buildResumePrompt } from "../../backlog/buildResumePrompt";
import type { Session } from "./createSession";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { runningSession, waitingSession } from "./runningSession";
import { spawnClaude } from "./spawnClaude";

type RestoreBase = ReturnType<typeof restoreBase>;

export function restoreInteractiveSession(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
): Session {
	/* why: assist sessions that wrap claude (e.g. `assist draft`) and plain claude
	 * sessions resume via their discovered sessionId. Pass the same restart nudge
	 * backlog runs use so the reattached conversation continues the interrupted
	 * work instead of sitting idle waiting for input (#404). */
	if (persisted.commandType !== "run" && persisted.claudeSessionId) {
		return resumeViaClaude(id, persisted, base);
	}

	/* why: a plain claude session that reaches here has no claudeSessionId to
	 * `--resume` and no run/assist args to retry, so the conversation is
	 * unrecoverable. Surface an error (logged by SessionManager.restore) instead
	 * of a silent "done" stub the client renders as "Starting…" forever (#396). */
	if (persisted.commandType === "claude") {
		return unrecoverableClaude(id, persisted);
	}

	/* why: run/assist sessions can be re-launched from their stored args, so a
	 * retryable "done" card is recoverable — only the unrecoverable claude case
	 * above is an error. */
	return notRestoredStub(base, persisted);
}

function resumeViaClaude(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
): Session {
	const idle = persisted.status === "waiting";
	const pty = spawnClaude({
		resumeSessionId: persisted.claudeSessionId,
		prompt: idle ? undefined : buildResumePrompt(),
		cwd: persisted.cwd,
		sessionId: id,
	});
	return idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
}

function unrecoverableClaude(id: string, persisted: PersistedSession): Session {
	return errorSession(
		id,
		persisted,
		"no claude session id was recorded before the daemon stopped, so the conversation cannot be resumed",
	);
}

function notRestoredStub(
	base: RestoreBase,
	persisted: PersistedSession,
): Session {
	return {
		...base,
		status: "done",
		startedAt: persisted.startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: null,
		pty: null,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		restored: false,
	};
}
