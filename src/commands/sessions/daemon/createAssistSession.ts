import type { Session } from "./createSession";
import { spawnPty } from "./spawnPty";

export type AssistSessionMeta = { title?: string; subtitle?: string };

export function createAssistSession(
	id: string,
	assistArgs: string[],
	cwd?: string,
	meta?: AssistSessionMeta,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: `assist ${assistArgs.join(" ")}`,
		title: meta?.title,
		subtitle: meta?.subtitle,
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
