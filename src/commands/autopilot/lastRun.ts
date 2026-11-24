import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";
import { formatLastRun } from "./formatLastRun";

export async function lastRun(): Promise<void> {
	const cwd = process.cwd();
	const reply = await requestDaemonReply<{ status: AutopilotStatus | null }>(
		{ type: "autopilot-status", cwd },
		"autopilot-status",
	);
	if (!reply) {
		console.error("The sessions daemon is not running.");
		process.exitCode = 1;
		return;
	}
	if (!reply.status) {
		console.log(`No autopilot schedule is set for ${cwd}.`);
		return;
	}
	const time = (iso: string) => new Date(iso).toLocaleString();
	console.log(formatLastRun(reply.status, time).join("\n"));
}
