import { eq, type SQLWrapper, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsageTotals } from "./phaseUsageTotals";
import { planPhaseCounts } from "./planPhaseCounts";
import { items } from "./schema";

export type ItemUsageStats = {
	itemCount: number;
	doneCount: number;
	repoCount: number;
	medianPhases: number;
	medianActiveMs: number;
	medianTokens: number;
};

type ItemUsageStatsOptions = {
	origin?: string;
};

function median(value: SQLWrapper) {
	return sql<number>`coalesce(percentile_cont(0.5) within group (order by (${value})::double precision), 0)`;
}

export async function itemUsageStats(
	db: Db,
	options?: ItemUsageStatsOptions,
): Promise<ItemUsageStats> {
	const totals = phaseUsageTotals(db);
	const planned = planPhaseCounts(db);
	const [row] = await db
		.select({
			itemCount: sql<number>`count(*)::int`,
			doneCount: sql<number>`count(*) filter (where ${items.status} = 'done')::int`,
			repoCount: sql<number>`count(distinct ${items.origin})::int`,
			medianPhases: median(
				sql`coalesce(${planned.count}, ${totals.recordedPhases})`,
			),
			medianActiveMs: median(totals.activeMs),
			medianTokens: median(sql`${totals.tokensUp} + ${totals.tokensDown}`),
		})
		.from(items)
		.innerJoin(totals, eq(totals.itemId, items.id))
		.leftJoin(planned, eq(planned.itemId, items.id))
		.where(options?.origin ? eq(items.origin, options.origin) : undefined);
	return {
		itemCount: Number(row?.itemCount ?? 0),
		doneCount: Number(row?.doneCount ?? 0),
		repoCount: Number(row?.repoCount ?? 0),
		medianPhases: Number(row?.medianPhases ?? 0),
		medianActiveMs: Number(row?.medianActiveMs ?? 0),
		medianTokens: Number(row?.medianTokens ?? 0),
	};
}
