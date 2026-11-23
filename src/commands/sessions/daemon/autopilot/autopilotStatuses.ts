import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStatus } from "./AutopilotStatus";
import { autopilotStatusOf } from "./autopilotStatusOf";
import type { AutopilotStore } from "./createAutopilotStore";
import { listAutopilotTargets } from "./listAutopilotTargets";
import { readAutopilotTarget } from "./readAutopilotTarget";
import { recordAutopilotItems } from "./recordAutopilotItems";

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
	return targets.map((target) => {
		recordAutopilotItems(store, started.deps, target.cwd);
		return autopilotStatusOf(
			target,
			localNode,
			store,
			started.runs,
			started.deps,
		);
	});
}
