import { asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { planPhaseCounts } from "../../shared/db/planPhaseCounts";
import { planPhaseRuns } from "../../shared/db/planPhaseRuns";
import { phaseUsageTotals } from "../../shared/db/phaseUsageTotals";
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
	const usageTotals = phaseUsageTotals(orm);
	const phaseCounts = planPhaseCounts(orm);
	const phaseRuns = planPhaseRuns(orm);
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
			runningPhases: phaseRuns.running,
			donePhases: phaseRuns.done,
			tokensUp: usageTotals.tokensUp,
			tokensDown: usageTotals.tokensDown,
			activeMs: usageTotals.activeMs,
			peakContextPct: usageTotals.peakContextPct,
		})
		.from(items)
		.leftJoin(usageTotals, eq(usageTotals.itemId, items.id))
		.leftJoin(phaseCounts, eq(phaseCounts.itemId, items.id))
		.leftJoin(phaseRuns, eq(phaseRuns.itemId, items.id))
		.where(origin === undefined ? undefined : eq(items.origin, origin))
		.orderBy(asc(items.id));
	return rows.map(rowToItemSummary);
}
