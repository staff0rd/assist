import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { listAutopilotTargets } from "./listAutopilotTargets";
import { recordAutopilotItems } from "./recordAutopilotItems";
import { recoverStalledItem } from "./recoverStalledItem";
import { tickAutopilotRepo } from "./tickAutopilotRepo";

export function tickAutopilot(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
): void {
	if (!started) return;
	started.deps.closeIdle?.();
	for (const target of listAutopilotTargets(started.deps.localNode())) {
		if (!target.scheduledHere) continue;
		recordAutopilotItems(store, started.deps, target.cwd);
		if (!recoverStalledItem(store, started, target))
			tickAutopilotRepo(store, started.runs, target);
		started.items.refresh(
			(store.repo(target.cwd).items ?? []).map((item) => item.id),
		);
	}
}
