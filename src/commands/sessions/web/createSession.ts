import { spawnClaude } from "./spawnClaude";

type SessionStatus = "running" | "waiting" | "done";

type Session = {
	id: string;
	name: string;
	status: SessionStatus;
	startedAt: number;
	pty: ReturnType<typeof spawnClaude>;
	scrollback: string;
	idleTimer: ReturnType<typeof setTimeout> | null;
	lastResizeAt: number;
};

type SessionInfo = {
	id: string;
	name: string;
	status: string;
	startedAt: number;
};

export type { Session, SessionInfo, SessionStatus };

export function createSession(
	id: string,
	prompt?: string,
	cwd?: string,
): Session {
	return {
		id,
		name: prompt?.slice(0, 40) || `Session ${id}`,
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude({ prompt, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
	};
}

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
): Session {
	return {
		id,
		name: name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`,
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude({ resumeSessionId: sessionId, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
	};
}
