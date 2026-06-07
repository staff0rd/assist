import type { Session } from "./createSession";
import { repoPrefix } from "./repoPrefix";
import { spawnClaude } from "./spawnClaude";

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
): Session {
	return {
		id,
		name: `${repoPrefix(cwd)}${name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`}`,
		commandType: "claude",
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude({ resumeSessionId: sessionId, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		cwd,
	};
}
