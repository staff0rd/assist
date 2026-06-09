import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

export function restoreSession(
	id: string,
	persisted: PersistedSession,
): Session {
	const base = {
		id,
		name: persisted.name,
		commandType: persisted.commandType,
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		cwd: persisted.cwd,
		assistArgs: persisted.assistArgs,
	};

	/* why: `assist backlog run` is a phase-orchestrating wrapper; a bare
	 * `claude --resume` pty never exits on completion, so re-launch the wrapper
	 * so the card reaches "done" and the phase chain continues (#304). */
	if (isBacklogRun(persisted)) {
		return {
			...base,
			status: "running",
			startedAt: Date.now(),
			pty: spawnPty(["assist", ...persisted.assistArgs], persisted.cwd, id),
			restored: true,
			activity: persisted.activity,
		};
	}

	// Assist sessions that wrap claude (e.g. `assist draft`) resume the same
	// way as plain claude sessions, via their discovered sessionId
	if (persisted.commandType !== "run" && persisted.claudeSessionId) {
		return {
			...base,
			status: "running",
			startedAt: Date.now(),
			pty: spawnClaude({
				resumeSessionId: persisted.claudeSessionId,
				cwd: persisted.cwd,
			}),
			claudeSessionId: persisted.claudeSessionId,
			restored: true,
			activity: persisted.activity,
		};
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
