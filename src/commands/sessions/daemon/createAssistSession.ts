import type { Session } from "./createSession";
import { spawnPty } from "./spawnPty";

export function createAssistSession(
	id: string,
	assistArgs: string[],
	cwd?: string,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: `assist ${assistArgs.join(" ")}`,
		commandType: "assist",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
		pty: spawnPty(["assist", ...assistArgs], cwd, id),
		scrollback: "",
		assistArgs,
		cwd,
	};
}
