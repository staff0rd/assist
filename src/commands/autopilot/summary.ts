import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import type { AutopilotSummaryResult } from "../sessions/daemon/autopilot/recordRunSummary";

type SummaryOptions = {
	checked: string;
	decided: string;
	started: string;
	next: string;
};

function fail(message: string): void {
	console.error(`Error: ${message}`);
	process.exitCode = 1;
}

export async function summary(options: SummaryOptions): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		return fail("not running in an assist session");
	const { checked, decided, started, next } = options;
	const reply = await requestDaemonReply<AutopilotSummaryResult>(
		{
			type: "autopilot-summary",
			sessionId,
			summary: { checked, decided, started, next },
		},
		"autopilot-summary",
	);
	if (!reply) return fail("the sessions daemon is not running");
	if (!reply.ok) return fail(reply.error);
	console.log(`Recorded this run's summary for ${reply.cwd}.`);
}
