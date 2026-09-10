import { eq } from "drizzle-orm";
import type { Db } from "./Db";
import { itemUsageOrderBy } from "./itemUsageOrderBy";
import { type ItemUsageFilter, itemUsageWhere } from "./itemUsageWhere";
import { lastPhaseActivity } from "./lastPhaseActivity";
import type { ItemUsageSort } from "./parseItemUsageSort";
import { phaseUsageTotals } from "./phaseUsageTotals";
import { planPhaseCounts } from "./planPhaseCounts";
import { items } from "./schema";
import {
	type ItemUsageSummaryRow,
	toItemUsageSummary,
} from "./toItemUsageSummary";

type ListItemUsageSummariesOptions = ItemUsageFilter & {
	limit?: number;
	offset?: number;
	sort?: ItemUsageSort;
};

export async function listItemUsageSummaries(
	db: Db,
	options?: ListItemUsageSummariesOptions,
): Promise<ItemUsageSummaryRow[]> {
	const totals = phaseUsageTotals(db);
	const planned = planPhaseCounts(db);
	const lastPhase = lastPhaseActivity(db);
	const query = db
		.select({
			id: items.id,
			origin: items.origin,
			type: items.type,
			name: items.name,
			status: items.status,
			phaseCount: planned.count,
			recordedPhases: totals.recordedPhases,
			tokensUp: totals.tokensUp,
			tokensDown: totals.tokensDown,
			activeMs: totals.activeMs,
			peakContextPct: totals.peakContextPct,
			lastPhaseAt: lastPhase.atIso,
		})
		.from(items)
		.innerJoin(totals, eq(totals.itemId, items.id))
		.leftJoin(planned, eq(planned.itemId, items.id))
		.leftJoin(lastPhase, eq(lastPhase.itemId, items.id))
		.where(itemUsageWhere(options))
		.orderBy(
			...itemUsageOrderBy({ totals, planned, lastPhase }, options?.sort),
		);
	const rows =
		options?.limit === undefined
			? await query
			: await query.limit(options.limit).offset(options.offset ?? 0);
	return rows.map(toItemUsageSummary);
}
