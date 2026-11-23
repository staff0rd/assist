import type { AutopilotItem, AutopilotRepoRecord } from "./AutopilotRecord";
import type { AutopilotStarted } from "./AutopilotStarted";

/** An item a run left in progress with nothing running it, read after it ended. */
export function findStalledItem(
	repo: AutopilotRepoRecord,
	{ deps, items }: AutopilotStarted,
): AutopilotItem | undefined {
	const lastEnd = repo.ticks.filter((t) => t.outcome === "finished").at(-1)?.at;
	if (!lastEnd) return undefined;
	const busy = (id: number) => deps.itemSessions(id).length > 0;
	for (const item of repo.items ?? []) if (busy(item.id)) items.seen(item.id);
	return repo.items?.find(
		(item) =>
			!item.stopped &&
			!busy(item.id) &&
			items.status(item.id, lastEnd) === "in-progress",
	);
}
