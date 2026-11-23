import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { autopilotScheduler } from "./autopilotScheduler";

export const handleAutopilotFailure: Handler = (client, _manager, data) => {
	const { sessionId, reason, phase } = data;
	if (typeof sessionId !== "string" || typeof reason !== "string") {
		daemonLog("autopilot: failure refused: needs a sessionId and a reason");
		sendTo(client, {
			type: "autopilot-failure",
			ok: false,
			error: "autopilot-failure needs a sessionId and a reason",
		});
		return;
	}
	daemonLog(`autopilot: failure reported by ${sessionId}: ${reason}`);
	const result = autopilotScheduler.reportFailure(sessionId, {
		reason,
		...(typeof phase === "string" ? { phase } : {}),
	});
	sendTo(client, { type: "autopilot-failure", ...result });
};
