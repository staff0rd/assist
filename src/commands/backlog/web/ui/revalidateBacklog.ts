import type { BacklogFilter } from "../parseBacklogFilter";
import { loadBacklogItems } from "./loadBacklogItems";
import type { BacklogItemSummary } from "./types";

type OnLoaded = (found: boolean, items: BacklogItemSummary[]) => void;

export function revalidateBacklog(
	cwd: string | undefined,
	filter: BacklogFilter,
	signal: AbortSignal,
	onLoaded: OnLoaded,
): void {
	(async () => {
		try {
			const { found, items } = await loadBacklogItems(cwd, filter, signal);
			if (!signal.aborted) onLoaded(found, items);
		} catch {
			// why: a transient failure (network blip, server mid-restart) must not throw
			// out of the polling loop — the next interval simply retries.
		}
	})();
}
