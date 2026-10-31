import { formatItemId } from "../../../../../backlog/formatItemId";
import type { BacklogItemSummary } from "../../../../../backlog/web/ui/types";

function matches(item: BacklogItemSummary, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return (
		item.name.toLowerCase().includes(q) ||
		formatItemId(item.id).includes(q.replace(/^#/, ""))
	);
}

export function groupBacklogItems(
	items: BacklogItemSummary[],
	query: string,
): { inProgress: BacklogItemSummary[]; todo: BacklogItemSummary[] } {
	const shown = items.filter((item) => matches(item, query));
	return {
		inProgress: shown.filter((item) => item.status === "in-progress"),
		todo: shown.filter((item) => item.status === "todo"),
	};
}
