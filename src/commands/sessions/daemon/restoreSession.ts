import { buildResumePrompt } from "../../backlog/buildResumePrompt";
import { backlogRunArgs } from "./backlogRunArgs";
import type { Session } from "./createSession";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";
import { runningSession } from "./runningSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

export function restoreSession(
	id: string,
	persisted: PersistedSession,
): Session {
	const base = restoreBase(id, persisted);

	/* why: `assist backlog run` is a phase-orchestrating wrapper; a bare
	 * `claude --resume` pty never exits on completion, so re-launch the wrapper
	 * so the card reaches "done" and the phase chain continues (#304). Pass the
	 * latest discovered sessionId so the wrapper resumes the interrupted phase's
	 * conversation instead of restarting it from scratch (#300). */
	if (isBacklogRun(persisted)) {
		const pty = spawnPty(backlogRunArgs(persisted), persisted.cwd, id);
		return runningSession(base, persisted, pty);
	}

	/* why: assist sessions that wrap claude (e.g. `assist draft`) and plain claude
	 * sessions resume via their discovered sessionId. Pass the same restart nudge
	 * backlog runs use so the reattached conversation continues the interrupted
	 * work instead of sitting idle waiting for input (#404). */
	if (persisted.commandType !== "run" && persisted.claudeSessionId) {
		const pty = spawnClaude({
			resumeSessionId: persisted.claudeSessionId,
			prompt: buildResumePrompt(),
			cwd: persisted.cwd,
			sessionId: id,
		});
		return runningSession(base, persisted, pty);
	}

	/* why: a plain claude session that reaches here has no claudeSessionId to
	 * `--resume` and no run/assist args to retry, so the conversation is
	 * unrecoverable. Surface an error (logged by SessionManager.restore) instead
	 * of a silent "done" stub the client renders as "Starting…" forever (#396). */
	if (persisted.commandType === "claude") {
		return errorSession(
			id,
			persisted,
			"no claude session id was recorded before the daemon stopped, so the conversation cannot be resumed",
		);
	}

	/* why: run/assist sessions can be re-launched from their stored args, so a
	 * retryable "done" card is recoverable — only the unrecoverable claude case
	 * above is an error. */
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

function isBacklogRun(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		persisted.commandType === "assist" &&
		persisted.assistArgs?.[0] === "backlog" &&
		persisted.assistArgs?.[1] === "run"
	);
}
