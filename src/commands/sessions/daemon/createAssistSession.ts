import type { Session } from "./createSession";
import { spawnPty } from "./spawnPty";

export function createAssistSession(
	id: string,
	assistArgs: string[],
	cwd?: string,
): Session {
	return {
		id,
		name: `assist ${assistArgs.join(" ")}`,
		commandType: "assist",
		status: "running",
		startedAt: Date.now(),
		pty: spawnPty(["assist", ...assistArgs], cwd, id),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		assistArgs,
		cwd,
	};
}
