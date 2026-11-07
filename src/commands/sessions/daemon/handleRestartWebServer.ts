import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { type Handler, routed } from "./routed";

export const handleRestartWebServer: Handler = routed((client, m, d) => {
	const count = m.clients.restartWebServers();
	daemonLog(`restart-webserver: signalled ${count} web server(s)`);
	sendTo(client, {
		type: "restart-webserver",
		ok: count > 0,
		error: count > 0 ? undefined : "no web server is connected to the daemon",
		...(typeof d.requestId === "string" ? { requestId: d.requestId } : {}),
	});
});
