import type { Session } from "../../commands/sessions/daemon/types";

export function makeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}
