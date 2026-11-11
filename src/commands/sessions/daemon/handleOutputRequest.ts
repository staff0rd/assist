import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { routeOutputToLink } from "./links/routeOutputToLink";
import type { Handler } from "./routed";
import { resolveOutputTarget } from "./resolveOutputTarget";

export const handleOutputRequest: Handler = (client, m, request) => {
	const d = routeOutputToLink(client, m.links, request);
	if (!d) return;
	const target = resolveOutputTarget(m, d);
	const requestId = d.requestId;
	if ("error" in target) {
		daemonLog(`output requested: ${target.error}`);
		sendTo(client, {
			type: "session-output",
			error: target.error,
			requestId,
		});
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
					requestId,
				}
			: { type: "session-output", sessionId, scrollback, exited, requestId },
	);
};
