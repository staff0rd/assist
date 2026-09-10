import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function countItemUsageSummaries(db: Db): Promise<number> {
	const [row] = await db
		.select({
			value: sql<number>`count(distinct ${phaseUsage.itemId})::int`,
		})
		.from(phaseUsage);
	return row?.value ?? 0;
}
