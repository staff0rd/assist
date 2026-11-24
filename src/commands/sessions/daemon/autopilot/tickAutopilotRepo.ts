import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotNextTickAt } from "./autopilotNextTickAt";
import type { AutopilotStore } from "./createAutopilotStore";
import { handOffHeldRun } from "./handOffHeldRun";
import type { AutopilotTarget } from "./readAutopilotTarget";

export function tickAutopilotRepo(
	store: AutopilotStore,
	started: AutopilotStarted,
	target: AutopilotTarget,
): void {
	const { runs } = started;
	runs.settle(target.cwd);
	const repo = store.repo(target.cwd);
	if (repo.paused) return;
	if (Date.now() < autopilotNextTickAt(repo, target.intervalMinutes)) return;
	const live = runs.liveRun(target.cwd);
	if (!live) runs.launch(target, "scheduled");
	else if (!handOffHeldRun(store, started, target, live.sessionId))
		runs.skip(target.cwd, live.sessionId);
}
