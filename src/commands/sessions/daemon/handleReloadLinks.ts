import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";

export const handleReloadLinks: Handler = (client, m) => {
	daemonLog("reload-links received");
	m.links.reload();
	sendTo(client, { type: "ack" });
};
