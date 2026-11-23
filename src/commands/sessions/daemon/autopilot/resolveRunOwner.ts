import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotRunOwner } from "./autopilotRunOwner";
import type { AutopilotStore } from "./createAutopilotStore";
import { listAutopilotTargets } from "./listAutopilotTargets";

/** The repo whose live autopilot run the session belongs to, or why it has none. */
export function resolveRunOwner(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	sessionId: string,
): { cwd: string; started: AutopilotStarted } | { error: string } {
	if (!started) return { error: "autopilot scheduler not started" };
	const scheduled = listAutopilotTargets(started.deps.localNode())
		.filter((target) => target.scheduledHere)
		.map((target) => target.cwd);
	const cwd = autopilotRunOwner(store, started.deps, sessionId, scheduled);
	if (!cwd)
		return {
			error: `session ${sessionId} is not an autopilot session or a run it started`,
		};
	return { cwd, started };
}
