import { sql } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { phaseUsage } from "../../shared/db/schema";

export function phaseUsageTotals(orm: Db) {
	return orm
		.select({
			itemId: phaseUsage.itemId,
			tokensUp: sql<number>`sum(${phaseUsage.tokensUp})::bigint`.as(
				"total_tokens_up",
			),
			tokensDown: sql<number>`sum(${phaseUsage.tokensDown})::bigint`.as(
				"total_tokens_down",
			),
			activeMs: sql<number>`sum(${phaseUsage.activeMs})::bigint`.as(
				"total_active_ms",
			),
			peakContextPct: sql<number>`max(${phaseUsage.peakContextPct})`.as(
				"max_peak_context_pct",
			),
		})
		.from(phaseUsage)
		.groupBy(phaseUsage.itemId)
		.as("usage_totals");
}
