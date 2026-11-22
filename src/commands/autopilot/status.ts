import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";
import { formatAutopilotStatus } from "./formatAutopilotStatus";

export async function status(): Promise<void> {
	const reply = await requestDaemonReply<{ statuses: AutopilotStatus[] }>(
		{ type: "autopilot-status" },
		"autopilot-status",
	);
	if (!reply) {
		console.error("The sessions daemon is not running.");
		process.exitCode = 1;
		return;
	}
	if (reply.statuses.length === 0) {
		console.log(
			"No repo has autopilot.intervalMinutes and autopilot.prompt set.",
		);
		return;
	}
	console.log(reply.statuses.flatMap(formatAutopilotStatus).join("\n"));
}
