import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { spawnClaude } from "./spawnClaude";

export function restoreSession(
	id: string,
	persisted: PersistedSession,
): Session {
	// Assist sessions that wrap claude (e.g. `assist draft`) resume the same
	// way as plain claude sessions, via their discovered sessionId
	if (persisted.commandType !== "run" && persisted.claudeSessionId) {
		return {
			id,
			name: persisted.name,
			commandType: persisted.commandType,
			status: "running",
			startedAt: Date.now(),
			pty: spawnClaude({
				resumeSessionId: persisted.claudeSessionId,
				cwd: persisted.cwd,
			}),
			scrollback: "",
			idleTimer: null,
			lastResizeAt: 0,
			assistArgs: persisted.assistArgs,
			cwd: persisted.cwd,
			claudeSessionId: persisted.claudeSessionId,
			restored: true,
			activity: persisted.activity,
		};
	}
	return {
		id,
		name: persisted.name,
		commandType: persisted.commandType,
		status: "done",
		startedAt: persisted.startedAt,
		pty: null,
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		assistArgs: persisted.assistArgs,
		cwd: persisted.cwd,
		restored: false,
	};
}
