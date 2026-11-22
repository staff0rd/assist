import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStatus } from "./AutopilotStatus";
import { autopilotStatusOf } from "./autopilotStatusOf";
import type { AutopilotStore } from "./createAutopilotStore";
import { listAutopilotTargets } from "./listAutopilotTargets";
import { readAutopilotTarget } from "./readAutopilotTarget";

export function autopilotStatuses(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	cwd?: string,
): AutopilotStatus[] {
	if (!started) return [];
	const localNode = started.deps.localNode();
	const targets = cwd
		? [readAutopilotTarget(cwd, localNode)].filter((t) => t !== undefined)
		: listAutopilotTargets(localNode);
	return targets.map((target) =>
		autopilotStatusOf(target, localNode, store, started.runs),
	);
}
