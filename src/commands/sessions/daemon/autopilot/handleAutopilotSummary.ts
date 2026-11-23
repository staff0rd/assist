import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { autopilotScheduler } from "./autopilotScheduler";
import { parseRunSummary } from "./parseRunSummary";

export const handleAutopilotSummary: Handler = (client, _manager, data) => {
	const summary = parseRunSummary(data.summary);
	const result =
		typeof summary === "string" || typeof data.sessionId !== "string"
			? {
					ok: false,
					error: typeof summary === "string" ? summary : "needs a sessionId",
				}
			: autopilotScheduler.recordSummary(data.sessionId, summary);
	if (!result.ok) daemonLog(`autopilot: summary refused: ${result.error}`);
	sendTo(client, { type: "autopilot-summary", ...result });
};
