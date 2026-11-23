import type { AutopilotStarted } from "./AutopilotStarted";
import { clearStaleRuns } from "./clearStaleRuns";
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
	const targets = listAutopilotTargets(started.deps.localNode()).filter(
		(target) => target.scheduledHere,
	);
	clearStaleRuns(
		store,
		targets.map((target) => target.cwd),
	);
	for (const target of targets) {
		recordAutopilotItems(store, started.deps, target.cwd);
		if (!recoverStalledItem(store, started, target))
			tickAutopilotRepo(store, started.runs, target);
		started.items.refresh(
			(store.repo(target.cwd).items ?? []).map((item) => item.id),
		);
	}
	/* why: a run held open for its summary is still current, so its idle root
	 * must not be closed. */
	const keep = new Set(
		store.cwds().flatMap((cwd) => store.repo(cwd).current?.sessionId ?? []),
	);
	started.deps.closeIdle?.(keep);
}
