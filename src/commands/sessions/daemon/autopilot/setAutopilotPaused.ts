import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotControlResult } from "./runAutopilotNow";

export function setAutopilotPaused(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	cwd: string,
	paused: boolean,
): AutopilotControlResult {
	return controlAutopilotTarget(started, cwd, (_, target) => {
		daemonLog(`autopilot: ${target.cwd} ${paused ? "paused" : "resumed"}`);
		store.update(target.cwd, (repo) => {
			repo.paused = paused;
			if (paused) return;
			repo.pauseReason = undefined;
			for (const item of repo.items ?? []) item.resumes = 0;
		});
		return { ok: true };
	});
}
