import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";
import type { SessionManager } from "./SessionManager";

type ServerTarget = { origin: string; group: string };

function resolveTarget(
	m: SessionManager,
	d: Record<string, unknown>,
): { sessionId: string } | { error: string } {
	const server = d.server as ServerTarget | undefined;
	if (!server) return { sessionId: d.sessionId as string };
	const run = m.liveServerRun(server.origin, server.group);
	return run
		? { sessionId: run.id }
		: {
				error: `No live server run for ${server.origin} (${server.group})`,
			};
}

export const handleOutputRequest: Handler = (client, m, d) => {
	const target = resolveTarget(m, d);
	if ("error" in target) {
		daemonLog(`output requested: ${target.error}`);
		sendTo(client, { type: "session-output", error: target.error });
		return;
	}
	const { sessionId } = target;
	let scrollback: string | undefined;
	m.update((sessions) => {
		scrollback = sessions.get(sessionId)?.scrollback;
		return false;
	});
	daemonLog(
		`output requested: id=${sessionId} ${scrollback === undefined ? "unknown session" : `${scrollback.length} chars`}`,
	);
	sendTo(
		client,
		scrollback === undefined
			? {
					type: "session-output",
					sessionId,
					error: `No session ${sessionId} on this node`,
				}
			: { type: "session-output", sessionId, scrollback },
	);
};
