import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import { awaitingSummary } from "./awaitingSummary";
import type { AutopilotStore } from "./createAutopilotStore";
import { launchAutopilotRun } from "./launchAutopilotRun";
import type { AutopilotTarget } from "./readAutopilotTarget";
import { settleAutopilotRun } from "./settleAutopilotRun";

export function createAutopilotRuns(
	store: AutopilotStore,
	deps: AutopilotDeps,
) {
	return {
		liveRun(cwd: string) {
			const current = store.repo(cwd).current;
			if (!current) return undefined;
			const state = deps.sessionState(current.sessionId);
			return state === "live" || awaitingSummary(current, state)
				? current
				: undefined;
		},
		settle: (cwd: string) => settleAutopilotRun(store, deps, cwd),
		launch: (target: AutopilotTarget, trigger: "scheduled" | "manual") =>
			launchAutopilotRun(store, deps, target, trigger),
		skip(cwd: string, sessionId: string): void {
			const reason = `${sessionId} still live`;
			daemonLog(`autopilot: ${cwd} tick skipped, ${reason}`);
			store.addTick(cwd, {
				outcome: "skipped",
				trigger: "scheduled",
				sessionId,
				reason,
			});
		},
	};
}

export type AutopilotRuns = ReturnType<typeof createAutopilotRuns>;
