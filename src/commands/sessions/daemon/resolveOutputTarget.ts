import type { Session } from "./createSession";
import { latestServerRun } from "./latestServerRun";
import type { SessionManager } from "./SessionManager";

type ResolvedTarget =
	| { sessionId: string; exited?: "done" | "error" }
	| { error: string };

type ServerTarget = { origin: string; group: string };

export function resolveOutputTarget(
	m: SessionManager,
	d: Record<string, unknown>,
): ResolvedTarget {
	const server = d.server as ServerTarget | undefined;
	if (!server) return { sessionId: d.sessionId as string };
	let run: Session | undefined;
	m.update((sessions) => {
		run = latestServerRun(sessions, server.origin, server.group);
		return false;
	});
	if (!run)
		return {
			error: `No live server run for ${server.origin} (${server.group})`,
		};
	return run.status === "done" || run.status === "error"
		? { sessionId: run.id, exited: run.status }
		: { sessionId: run.id };
}
