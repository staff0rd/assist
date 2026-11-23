import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import type { AutopilotControlResult } from "./runAutopilotNow";

export function stopAutopilotRun(
	started: AutopilotStarted | undefined,
	cwd: string,
): AutopilotControlResult {
	return controlAutopilotTarget(started, cwd, ({ deps, runs }, target) => {
		const live = runs.liveRun(target.cwd);
		if (!live) return { ok: false, error: "no autopilot run is live" };
		daemonLog(`autopilot: ${target.cwd} stopping run ${live.sessionId}`);
		deps.stopSession(live.sessionId);
		return { ok: true };
	});
}
