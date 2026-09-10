import { asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { items, phaseUsage } from "./schema";

export type ItemUsageOriginCount = {
	origin: string;
	count: number;
};

export async function countItemUsageByOrigin(
	db: Db,
): Promise<ItemUsageOriginCount[]> {
	const count = sql<number>`count(distinct ${phaseUsage.itemId})::int`;
	const rows = await db
		.select({ origin: items.origin, count })
		.from(items)
		.innerJoin(phaseUsage, eq(phaseUsage.itemId, items.id))
		.groupBy(items.origin)
		.orderBy(desc(count), asc(items.origin));
	return rows.map((row) => ({ origin: row.origin, count: Number(row.count) }));
}
