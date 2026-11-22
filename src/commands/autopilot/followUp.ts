import { parseDuration } from "../../shared/parseDuration";
import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import type { AutopilotFollowUpResult } from "../sessions/daemon/autopilot/requestAutopilotFollowUp";

function fail(message: string): void {
	console.error(`Error: ${message}`);
	process.exitCode = 1;
}

export async function followUp(duration: string): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		return fail("not running in an assist session");
	let delayMs: number;
	try {
		delayMs = parseDuration(duration);
	} catch (error) {
		return fail(error instanceof Error ? error.message : String(error));
	}
	const reply = await requestDaemonReply<AutopilotFollowUpResult>(
		{ type: "autopilot-follow-up", sessionId, delayMs },
		"autopilot-follow-up",
	);
	if (!reply) return fail("the sessions daemon is not running");
	if (!reply.ok) return fail(reply.error);
	console.log(
		`Next autopilot tick for ${reply.cwd} at ${new Date(reply.at).toLocaleString()}.`,
	);
}
