import { isSdkSession } from "./isSdkSession";
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
	let sdk = false;
	m.update((sessions) => {
		const session = sessions.get(sessionId);
		sdk = session ? isSdkSession(session) : false;
		scrollback = session?.scrollback;
		return false;
	});
	if (sdk) {
		const error = `Session ${sessionId} is a Claude (SDK) session with no terminal output`;
		daemonLog(
			`output requested: id=${sessionId} skipped (Claude SDK session, no terminal)`,
		);
		sendTo(client, { type: "session-output", sessionId, error, requestId });
		return;
	}
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
