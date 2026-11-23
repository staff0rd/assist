import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import { findStalledItem } from "./findStalledItem";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotTarget } from "./readAutopilotTarget";
import { pauseOnFailure } from "./pauseOnFailure";
import { resumeItemPrompt } from "./resumeItemPrompt";

/** Resume an item a run left unfinished; pause if it stalls again. True when it acted. */
export function recoverStalledItem(
	store: AutopilotStore,
	started: AutopilotStarted,
	target: AutopilotTarget,
): boolean {
	const { runs } = started;
	runs.settle(target.cwd);
	const repo = store.repo(target.cwd);
	if (repo.paused || runs.liveRun(target.cwd)) return false;
	const stalled = findStalledItem(repo, started);
	if (!stalled) return false;
	const id = formatItemId(stalled.id);
	if ((stalled.resumes ?? 0) >= 1) {
		pauseOnFailure(store, started.deps, target.cwd, {
			item: id,
			reason:
				"still not done, and nothing is running it, after autopilot already resumed it once",
		});
		return true;
	}
	daemonLog(`autopilot: ${target.cwd} resuming stalled item ${id}`);
	store.update(target.cwd, (next) => {
		const item = next.items?.find((i) => i.id === stalled.id);
		if (item) item.resumes = (item.resumes ?? 0) + 1;
	});
	runs.launch({ ...target, prompt: resumeItemPrompt(stalled.id) }, "scheduled");
	return true;
}
