import { autopilotNextTickAt } from "./autopilotNextTickAt";
import type { AutopilotRuns } from "./createAutopilotRuns";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotTarget } from "./readAutopilotTarget";

export function tickAutopilotRepo(
	store: AutopilotStore,
	runs: AutopilotRuns,
	target: AutopilotTarget,
): void {
	runs.settle(target.cwd);
	const repo = store.repo(target.cwd);
	if (repo.paused) return;
	if (Date.now() < autopilotNextTickAt(repo, target.intervalMinutes)) return;
	const live = runs.liveRun(target.cwd);
	if (live) runs.skip(target.cwd, live.sessionId);
	else runs.launch(target, "scheduled");
}
