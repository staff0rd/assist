import { skipsTerminalPath } from "./skipsTerminalPath";
import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";
import { sessionSnapshot } from "./sessionSnapshot";

export const handleSnapshotRequest: Handler = (client, m, d) => {
	const sessionId = d.sessionId as string;
	let data: string | undefined;
	m.update((sessions) => {
		const s = sessions.get(sessionId);
		if (s && !skipsTerminalPath(s, "snapshot")) data = sessionSnapshot(s);
		return false;
	});
	daemonLog(
		`snapshot requested: id=${sessionId} ${data === undefined ? "not local" : `${data.length} chars`}`,
	);
	if (data !== undefined) sendTo(client, { type: "snapshot", sessionId, data });
};
