import { formatItemId } from "../../../backlog/formatItemId";
import type { AutopilotStarted } from "./AutopilotStarted";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import type { AutopilotControlResult } from "./runAutopilotNow";

/* why: a hand-started run carries no autopilot mark, so its previews would wait
 * for the user; resuming through a tick keeps auto-accept and one live run. */
export function resumeAutopilotItem(
	started: AutopilotStarted | undefined,
	cwd: string,
	itemId: number,
): AutopilotControlResult {
	return controlAutopilotTarget(started, cwd, ({ runs }, target) => {
		runs.settle(target.cwd);
		const live = runs.liveRun(target.cwd);
		if (live)
			return { ok: false, error: `run ${live.sessionId} is still live` };
		const id = formatItemId(itemId);
		runs.launch(
			{
				...target,
				prompt: `Resume backlog item ${id}: an earlier autopilot run started it but it stalled before it was done. Run \`assist backlog run ${id}\` and see it through to done.`,
			},
			"manual",
		);
		return { ok: true };
	});
}
