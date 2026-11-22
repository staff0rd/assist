import type { AutopilotRuns } from "./createAutopilotRuns";
import type { AutopilotTarget } from "./readAutopilotTarget";

export type AutopilotControlResult =
	| { ok: true }
	| { ok: false; error: string };

export function runAutopilotNow(
	runs: AutopilotRuns,
	target: AutopilotTarget,
): AutopilotControlResult {
	runs.settle(target.cwd);
	const live = runs.liveRun(target.cwd);
	if (live) return { ok: false, error: `run ${live.sessionId} is still live` };
	runs.launch(target, "manual");
	return { ok: true };
}
