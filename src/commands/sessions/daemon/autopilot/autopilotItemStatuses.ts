import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStatus } from "./AutopilotStatus";
import type { AutopilotRepoRecord } from "./AutopilotRecord";

export function autopilotItemStatuses(
	repo: AutopilotRepoRecord,
	deps: AutopilotDeps,
): AutopilotStatus["items"] {
	const runs = repo.current ? deps.runItems(repo.current.sessionId) : [];
	return (repo.items ?? [])
		.map((item) => ({
			...item,
			sessionId:
				runs.find((run) => run.itemId === item.id && run.live)?.sessionId ??
				null,
		}))
		.reverse();
}
