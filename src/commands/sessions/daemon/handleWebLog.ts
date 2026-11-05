import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";

export const handleWebLog: Handler = (client, _m, d) => {
	daemonLog(`web: ${String(d.message)}`);
	sendTo(client, { type: "web-logged" });
};
