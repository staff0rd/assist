import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";

export const handleOutputRequest: Handler = (client, m, d) => {
	const sessionId = d.sessionId as string;
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
