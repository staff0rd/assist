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

export type { Session, SessionStatus };

export function createSession(id: string, prompt?: string): Session {
	return {
		id,
		name: prompt?.slice(0, 40) || `Session ${id}`,
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude(prompt),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
	};
}
