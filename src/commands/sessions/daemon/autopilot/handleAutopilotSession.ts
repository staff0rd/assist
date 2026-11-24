import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { autopilotScheduler } from "./autopilotScheduler";

/** Whether a session belongs to an autopilot run, and when that run's schedule next ticks. */
export const handleAutopilotSession: Handler = (client, manager, data) => {
	const id = typeof data.sessionId === "string" ? data.sessionId : "";
	const autopilot = !!manager.session(id)?.autopilot;
	const nextTickAt = autopilot ? autopilotScheduler.nextTickAt(id) : undefined;
	daemonLog(
		`autopilot: session ${id} lookup: ${autopilot ? `autopilot, next tick ${nextTickAt ?? "unknown"}` : "not autopilot"}`,
	);
	sendTo(client, { type: "autopilot-session", autopilot, nextTickAt });
};
