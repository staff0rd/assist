import type { BacklogItemSummary, BacklogStatus, BacklogType } from "./types";

type ItemSummaryRow = {
	id: number;
	origin: string;
	type: string;
	name: string;
	status: string;
	starred: boolean;
	jiraKey: string | null;
	githubIssue: string | null;
	currentPhase: number | null;
	planPhaseCount: number | null;
	incompleteSubtasks: number | null;
	tokensUp: number | null;
	tokensDown: number | null;
	activeMs: number | null;
	peakContextPct: number | null;
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
		githubIssue: row.githubIssue ?? undefined,
		currentPhase: row.currentPhase ?? undefined,
		totalPhases: (row.planPhaseCount || 1) + 1,
		incompleteSubtasks: row.incompleteSubtasks ?? 0,
		usageTotal:
			row.tokensUp == null
				? undefined
				: {
						tokensUp: Number(row.tokensUp),
						tokensDown: Number(row.tokensDown),
						activeMs: Number(row.activeMs),
						peakContextPct: Number(row.peakContextPct ?? 0),
					},
	};
}
