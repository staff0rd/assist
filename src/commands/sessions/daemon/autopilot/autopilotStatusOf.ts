import type { AutopilotStatus } from "./AutopilotStatus";
import { autopilotNextTickAt } from "./autopilotNextTickAt";
import type { AutopilotRuns } from "./createAutopilotRuns";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotTarget } from "./readAutopilotTarget";

export function autopilotStatusOf(
	target: AutopilotTarget,
	localNode: string,
	store: AutopilotStore,
	runs: AutopilotRuns,
): AutopilotStatus {
	const repo = store.repo(target.cwd);
	const scheduled = target.scheduledHere && !repo.paused;
	const next = autopilotNextTickAt(repo, target.intervalMinutes);
	return {
		cwd: target.cwd,
		prompt: target.prompt,
		intervalMinutes: target.intervalMinutes,
		node: target.node ?? null,
		localNode,
		scheduledHere: target.scheduledHere,
		paused: repo.paused,
		running: runs.liveRun(target.cwd) ?? null,
		nextTickAt: scheduled
			? new Date(Math.max(next, Date.now())).toISOString()
			: null,
		lastTick: repo.ticks.at(-1) ?? null,
	};
}
