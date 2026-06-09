import { backlogRunArgs } from "./backlogRunArgs";
import type { Session } from "./createSession";
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

	// Assist sessions that wrap claude (e.g. `assist draft`) resume the same
	// way as plain claude sessions, via their discovered sessionId
	if (persisted.commandType !== "run" && persisted.claudeSessionId) {
		const pty = spawnClaude({
			resumeSessionId: persisted.claudeSessionId,
			cwd: persisted.cwd,
		});
		return runningSession(base, persisted, pty);
	}

	return {
		...base,
		status: "done",
		startedAt: persisted.startedAt,
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
