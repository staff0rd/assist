import type { AutopilotDeps } from "./AutopilotDeps";
import { autopilotItemStatuses } from "./autopilotItemStatuses";
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
	deps: AutopilotDeps,
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
		pauseReason: repo.pauseReason ?? null,
		running: runs.liveRun(target.cwd) ?? null,
		nextTickAt: scheduled
			? new Date(Math.max(next, Date.now())).toISOString()
			: null,
		followUp: scheduled ? (repo.followUp ?? null) : null,
		lastTick: repo.ticks.at(-1) ?? null,
		lastRun: repo.ticks.filter((t) => t.outcome === "finished").at(-1) ?? null,
		items: autopilotItemStatuses(repo, deps),
	};
}
