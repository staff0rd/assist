import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotTarget } from "./readAutopilotTarget";
import { resumeItemPrompt } from "./resumeItemPrompt";

/** Resume an item a run left unfinished; pause if it stalls again. True when it acted. */
export function recoverStalledItem(
	store: AutopilotStore,
	{ runs, items }: AutopilotStarted,
	target: AutopilotTarget,
): boolean {
	runs.settle(target.cwd);
	const repo = store.repo(target.cwd);
	if (repo.paused || runs.liveRun(target.cwd)) return false;
	const lastEnd = repo.ticks.filter((t) => t.outcome === "finished").at(-1)?.at;
	if (!lastEnd) return false;
	const stalled = repo.items?.find(
		(item) => !item.stopped && items.status(item.id, lastEnd) === "in-progress",
	);
	if (!stalled) return false;
	const id = formatItemId(stalled.id);
	if ((stalled.resumes ?? 0) >= 1) {
		const reason = `${id} stalled again after it was resumed`;
		daemonLog(`autopilot: ${target.cwd} paused: ${reason}`);
		store.update(target.cwd, (next) => {
			next.paused = true;
			next.pauseReason = reason;
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
