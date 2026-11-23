import type { AutopilotStarted } from "./AutopilotStarted";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import type { AutopilotStore } from "./createAutopilotStore";
import { resumeItemPrompt } from "./resumeItemPrompt";
import type { AutopilotControlResult } from "./runAutopilotNow";

/* why: a hand-started run carries no autopilot mark, so its previews would wait
 * for the user; resuming through a tick keeps auto-accept and one live run. */
export function resumeAutopilotItem(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	cwd: string,
	itemId: number,
): AutopilotControlResult {
	return controlAutopilotTarget(started, cwd, ({ runs }, target) => {
		runs.settle(target.cwd);
		const live = runs.liveRun(target.cwd);
		if (live)
			return { ok: false, error: `run ${live.sessionId} is still live` };
		store.update(target.cwd, (repo) => {
			const item = repo.items?.find((i) => i.id === itemId);
			if (item) Object.assign(item, { stopped: false, resumes: 0 });
		});
		runs.launch({ ...target, prompt: resumeItemPrompt(itemId) }, "manual");
		return { ok: true };
	});
}
