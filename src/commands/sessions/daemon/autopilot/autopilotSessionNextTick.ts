import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotControlTarget } from "./autopilotControlTarget";
import { autopilotNextTickAt } from "./autopilotNextTickAt";
import type { AutopilotStore } from "./createAutopilotStore";
import { resolveRunOwner } from "./resolveRunOwner";

/** When the schedule owning the session's live run next ticks, as an ISO time. */
export function autopilotSessionNextTick(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	sessionId: string,
): string | undefined {
	const owner = resolveRunOwner(store, started, sessionId);
	if ("error" in owner) return undefined;
	const found = autopilotControlTarget(
		owner.cwd,
		owner.started.deps.localNode(),
	);
	if ("error" in found) return undefined;
	return new Date(
		autopilotNextTickAt(store.repo(owner.cwd), found.target.intervalMinutes),
	).toISOString();
}
