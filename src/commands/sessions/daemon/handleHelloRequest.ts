import { sendTo } from "./broadcast";
import { buildHello } from "./buildHello";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";

export const handleHelloRequest: Handler = (client, m, d) => {
	sendTo(client, buildHello());
	if (d.peer !== true) return m.replayAll(client);
	daemonLog(
		`peer link from ${d.nodeName ?? "unknown node"} (${d.version ?? "unknown version"}); exporting local sessions only`,
	);
	m.clients.markPeer(
		client,
		typeof d.nodeName === "string" ? d.nodeName : undefined,
	);
	sendTo(client, { type: "sessions", sessions: m.localSessions(), active: {} });
	m.replayLocal(client);
};
