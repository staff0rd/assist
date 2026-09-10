import { desc, type SQL, sql } from "drizzle-orm";
import type { lastPhaseActivity } from "./lastPhaseActivity";
import {
	defaultItemUsageSort,
	type ItemUsageSort,
	type ItemUsageSortField,
} from "./parseItemUsageSort";
import type { phaseUsageTotals } from "./phaseUsageTotals";
import type { planPhaseCounts } from "./planPhaseCounts";
import { items } from "./schema";

type ItemUsageJoins = {
	totals: ReturnType<typeof phaseUsageTotals>;
	planned: ReturnType<typeof planPhaseCounts>;
	lastPhase: ReturnType<typeof lastPhaseActivity>;
};

export function itemUsageOrderBy(
	joins: ItemUsageJoins,
	sort: ItemUsageSort = defaultItemUsageSort,
): SQL[] {
	const { totals, planned, lastPhase } = joins;
	const sortable: Record<ItemUsageSortField, SQL> = {
		phases: sql`coalesce(${planned.count}, ${totals.recordedPhases})`,
		active: sql`${totals.activeMs}`,
		tokens: sql`${totals.tokensUp} + ${totals.tokensDown}`,
		peakContext: sql`${totals.peakContextPct}`,
		lastPhase: sql`${lastPhase.at}`,
	};
	const order = sort.direction === "asc" ? sql`asc` : sql`desc`;
	return [sql`${sortable[sort.field]} ${order} nulls last`, desc(items.id)];
}
