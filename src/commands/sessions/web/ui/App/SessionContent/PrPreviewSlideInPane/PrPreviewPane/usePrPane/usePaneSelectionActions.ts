import type { PendingComment } from "../../../../PendingComment";
import type { PersistedComment } from "../PersistedComment";

export function usePaneSelectionActions(
	pending: PendingComment | null,
	add: (comment: PersistedComment) => void,
	collapse: (quote: string) => void,
	clear: () => void,
) {
	return {
		onAdd: (note: string) => {
			if (pending)
				add({
					quote: pending.quote,
					note,
					start: pending.start,
					end: pending.end,
				});
			clear();
		},
		onCollapse: () => {
			if (pending) collapse(pending.quote);
			clear();
		},
	};
}
