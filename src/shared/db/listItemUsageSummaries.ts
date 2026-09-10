import { desc, eq, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { lastPhaseActivity } from "./lastPhaseActivity";
import { phaseUsageTotals } from "./phaseUsageTotals";
import { planPhaseCounts } from "./planPhaseCounts";
import { items } from "./schema";
import {
	type ItemUsageSummaryRow,
	toItemUsageSummary,
} from "./toItemUsageSummary";

type ListItemUsageSummariesOptions = {
	limit?: number;
	offset?: number;
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
		.orderBy(sql`${lastPhase.at} desc nulls last`, desc(items.id));
	const rows =
		options?.limit === undefined
			? await query
			: await query.limit(options.limit).offset(options.offset ?? 0);
	return rows.map(toItemUsageSummary);
}
