import type { BacklogItemSummary, BacklogStatus, BacklogType } from "./types";

type ItemSummaryRow = {
	id: number;
	origin: string;
	type: string;
	name: string;
	status: string;
	starred: boolean;
	jiraKey: string | null;
	incompleteSubtasks: number | null;
	tokensUp: number | null;
	tokensDown: number | null;
	activeMs: number | null;
};

export function rowToItemSummary(row: ItemSummaryRow): BacklogItemSummary {
	return {
		id: row.id,
		origin: row.origin,
		type: row.type as BacklogType,
		name: row.name,
		status: row.status as BacklogStatus,
		starred: row.starred,
		jiraKey: row.jiraKey ?? undefined,
		incompleteSubtasks: row.incompleteSubtasks ?? 0,
		usageTotal:
			row.tokensUp == null
				? undefined
				: {
						tokensUp: Number(row.tokensUp),
						tokensDown: Number(row.tokensDown),
						activeMs: Number(row.activeMs),
					},
	};
}
