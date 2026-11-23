import type { AutopilotRunSummary } from "./AutopilotRecord";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { recordRunSummary } from "./recordRunSummary";
import {
	type AutopilotFailureReport,
	reportAutopilotFailure,
} from "./reportAutopilotFailure";
import { requestAutopilotFollowUp } from "./requestAutopilotFollowUp";

/** What a session in a live run can report back to its schedule. */
export function autopilotRunReports(
	store: AutopilotStore,
	started: () => AutopilotStarted | undefined,
) {
	return {
		followUp: (sessionId: string, delayMs: number) =>
			requestAutopilotFollowUp(store, started(), sessionId, delayMs),
		recordSummary: (sessionId: string, summary: AutopilotRunSummary) =>
			recordRunSummary(store, started(), sessionId, summary),
		reportFailure: (sessionId: string, report: AutopilotFailureReport) =>
			reportAutopilotFailure(store, started(), sessionId, report),
	};
}
