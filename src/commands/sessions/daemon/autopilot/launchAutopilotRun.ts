import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotTarget } from "./readAutopilotTarget";

export function launchAutopilotRun(
	store: AutopilotStore,
	deps: AutopilotDeps,
	target: AutopilotTarget,
	trigger: "scheduled" | "manual",
): void {
	try {
		const sessionId = deps.launch(target.cwd, target.prompt);
		daemonLog(
			`autopilot: ${target.cwd} launched ${sessionId} (${trigger}): ${target.prompt}`,
		);
		store.addTick(
			target.cwd,
			{ outcome: "launched", trigger, sessionId },
			(repo) => {
				repo.current = { sessionId, startedAt: new Date().toISOString() };
			},
		);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(`autopilot: ${target.cwd} launch failed (${trigger}): ${reason}`);
		store.addTick(target.cwd, { outcome: "failed", trigger, reason });
	}
}
