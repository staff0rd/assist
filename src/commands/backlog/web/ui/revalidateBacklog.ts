import { loadBacklogItems } from "./loadBacklogItems";
import type { BacklogItemSummary } from "./types";

type OnLoaded = (found: boolean, items: BacklogItemSummary[]) => void;

export function revalidateBacklog(
	cwd: string | undefined,
	showCompleted: boolean,
	signal: AbortSignal,
	onLoaded: OnLoaded,
): void {
	(async () => {
		try {
			const { found, items } = await loadBacklogItems(
				cwd,
				showCompleted,
				signal,
			);
			if (!signal.aborted) onLoaded(found, items);
		} catch (err) {
			if (!signal.aborted) throw err;
		}
	})();
}
