import { asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { incompleteSubtaskCounts } from "./incompleteSubtaskCounts";
import { planPhaseCounts } from "./planPhaseCounts";
import { phaseUsageTotals } from "./phaseUsageTotals";
import { rowToItemSummary } from "./rowToItemSummary";
import type { BacklogItemSummary } from "./types";

/**
 * Load lightweight summaries for the backlog list: only the columns the list
 * renders (id, origin, type, name, status). Unlike {@link ./loadAllItems} this
 * never touches the relation tables — descriptions, acceptance criteria,
 * comments, links, phases and tasks are fetched on demand by {@link ./loadItem}
 * when a single item is opened, keeping the index fast for large backlogs.
 */
export async function loadItemSummaries(
	orm: Db,
	origin?: string,
): Promise<BacklogItemSummary[]> {
	const incompleteCounts = incompleteSubtaskCounts(orm);
	const usageTotals = phaseUsageTotals(orm);
	const phaseCounts = planPhaseCounts(orm);
	const rows = await orm
		.select({
			id: items.id,
			origin: items.origin,
			type: items.type,
			name: items.name,
			status: items.status,
			starred: items.starred,
			jiraKey: items.jiraKey,
			githubIssue: items.githubIssue,
			currentPhase: items.currentPhase,
			planPhaseCount: phaseCounts.count,
			incompleteSubtasks: incompleteCounts.count,
			tokensUp: usageTotals.tokensUp,
			tokensDown: usageTotals.tokensDown,
			activeMs: usageTotals.activeMs,
			peakContextPct: usageTotals.peakContextPct,
		})
		.from(items)
		.leftJoin(incompleteCounts, eq(incompleteCounts.itemId, items.id))
		.leftJoin(usageTotals, eq(usageTotals.itemId, items.id))
		.leftJoin(phaseCounts, eq(phaseCounts.itemId, items.id))
		.where(origin === undefined ? undefined : eq(items.origin, origin))
		.orderBy(asc(items.id));
	return rows.map(rowToItemSummary);
}
