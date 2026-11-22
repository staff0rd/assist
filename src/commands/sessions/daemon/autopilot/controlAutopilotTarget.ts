import { autopilotControlTarget } from "./autopilotControlTarget";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotTarget } from "./readAutopilotTarget";
import type { AutopilotControlResult } from "./runAutopilotNow";

export function controlAutopilotTarget(
	started: AutopilotStarted | undefined,
	cwd: string,
	act: (
		started: AutopilotStarted,
		target: AutopilotTarget,
	) => AutopilotControlResult,
): AutopilotControlResult {
	if (!started) return { ok: false, error: "autopilot scheduler not started" };
	const found = autopilotControlTarget(cwd, started.deps.localNode());
	if ("error" in found) return { ok: false, error: found.error };
	return act(started, found.target);
}
