import type { BacklogFilter } from "../parseBacklogFilter";
import { loadBacklogItems } from "./loadBacklogItems";
import type { BacklogItemSummary } from "./types";

export type BacklogLoadHandlers = {
	onLoaded: (items: BacklogItemSummary[]) => void;
	onError: (message: string) => void;
};

export function revalidateBacklog(
	cwd: string | undefined,
	filter: BacklogFilter,
	signal: AbortSignal,
	{ onLoaded, onError }: BacklogLoadHandlers,
	node?: string,
): Promise<void> {
	return (async () => {
		try {
			const items = await loadBacklogItems(cwd, filter, signal, node);
			if (!signal.aborted) onLoaded(items);
		} catch (error) {
			// why: a transient failure (network blip, server mid-restart) must not throw
			// out of the polling loop — the next interval simply retries.
			if (!signal.aborted)
				onError(error instanceof Error ? error.message : "Failed to load.");
		}
	})();
}
