import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStatus } from "./AutopilotStatus";
import { autopilotStatuses } from "./autopilotStatuses";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import { createAutopilotRuns } from "./createAutopilotRuns";
import {
	type AutopilotStore,
	createAutopilotStore,
} from "./createAutopilotStore";
import {
	type AutopilotFollowUpResult,
	requestAutopilotFollowUp,
} from "./requestAutopilotFollowUp";
import {
	type AutopilotControlResult,
	runAutopilotNow,
} from "./runAutopilotNow";
import { setAutopilotPaused } from "./setAutopilotPaused";
import { stopAutopilotItem } from "./stopAutopilotItem";
import { stopAutopilotRun } from "./stopAutopilotRun";
import { resumeAutopilotItem } from "./resumeAutopilotItem";
import { tickAutopilot } from "./tickAutopilot";

const CHECK_MS = 60_000;

export function createAutopilotScheduler(
	store: AutopilotStore = createAutopilotStore(),
) {
	let started: AutopilotStarted | undefined;

	const tick = (): void => tickAutopilot(store, started);

	return {
		start(deps: AutopilotDeps): () => void {
			started = { deps, runs: createAutopilotRuns(store, deps) };
			store.load();
			tick();
			const timer = setInterval(tick, CHECK_MS);
			timer.unref();
			return () => clearInterval(timer);
		},
		status: (cwd: string): AutopilotStatus | undefined =>
			autopilotStatuses(store, started, cwd)[0],
		statuses: (): AutopilotStatus[] => autopilotStatuses(store, started),
		runNow: (cwd: string): AutopilotControlResult =>
			controlAutopilotTarget(started, cwd, ({ runs }, target) =>
				runAutopilotNow(runs, target),
			),
		followUp: (sessionId: string, delayMs: number): AutopilotFollowUpResult =>
			requestAutopilotFollowUp(store, started, sessionId, delayMs),
		setPaused: (cwd: string, paused: boolean): AutopilotControlResult =>
			setAutopilotPaused(store, started, cwd, paused),
		stopItem: (cwd: string, itemId?: number): AutopilotControlResult =>
			itemId === undefined
				? stopAutopilotRun(started, cwd)
				: stopAutopilotItem(store, started, cwd, itemId),
		resumeItem: (cwd: string, itemId: number): AutopilotControlResult =>
			resumeAutopilotItem(started, cwd, itemId),
	};
}
