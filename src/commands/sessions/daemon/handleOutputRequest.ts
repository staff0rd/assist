import { sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { latestServerRun } from "./latestServerRun";
import type { Handler } from "./routed";
import type { SessionManager } from "./SessionManager";

type ServerTarget = { origin: string; group: string };

type ResolvedTarget =
	| { sessionId: string; exited?: "done" | "error" }
	| { error: string };

function resolveTarget(
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

export const handleOutputRequest: Handler = (client, m, d) => {
	const target = resolveTarget(m, d);
	if ("error" in target) {
		daemonLog(`output requested: ${target.error}`);
		sendTo(client, { type: "session-output", error: target.error });
		return;
	}
	const { sessionId, exited } = target;
	let scrollback: string | undefined;
	m.update((sessions) => {
		scrollback = sessions.get(sessionId)?.scrollback;
		return false;
	});
	daemonLog(
		`output requested: id=${sessionId}${exited ? ` (exited: ${exited})` : ""} ${scrollback === undefined ? "unknown session" : `${scrollback.length} chars`}`,
	);
	sendTo(
		client,
		scrollback === undefined
			? {
					type: "session-output",
					sessionId,
					error: `No session ${sessionId} on this node`,
				}
			: { type: "session-output", sessionId, scrollback, exited },
	);
};
