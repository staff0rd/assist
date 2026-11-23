import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import type { AutopilotStore } from "./createAutopilotStore";
import type { AutopilotControlResult } from "./runAutopilotNow";

export function stopAutopilotItem(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	cwd: string,
	itemId: number,
): AutopilotControlResult {
	return controlAutopilotTarget(started, cwd, ({ deps }, target) => {
		const current = store.repo(target.cwd).current;
		const sessions = current
			? deps
					.runItems(current.sessionId)
					.filter((run) => run.itemId === itemId && run.live)
			: [];
		if (sessions.length === 0)
			return { ok: false, error: `no live run for item ${itemId}` };
		daemonLog(
			`autopilot: ${target.cwd} stopping item ${itemId}: session(s) ${sessions.map((run) => run.sessionId).join(", ")}`,
		);
		for (const run of sessions) deps.stopSession(run.sessionId);
		return { ok: true };
	});
}
