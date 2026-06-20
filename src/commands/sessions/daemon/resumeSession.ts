import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`,
		commandType: "claude",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
		pty: spawnClaude({ resumeSessionId: sessionId, cwd, sessionId: id }),
		scrollback: "",
		cwd,
	};
}
