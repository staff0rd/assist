import { and, eq, sql } from "drizzle-orm";
import type { UsageWindowKey } from "../usageWindowKey";
import type { Db } from "./Db";
import { resolveCycleResetsAt } from "./resolveCycleResetsAt";
import { usagePeaks } from "./schema";

export async function recordWindowTokens(
	db: Db,
	window: UsageWindowKey,
	resetsAt: number,
	tokensUp: number,
	tokensDown: number,
): Promise<void> {
	if (tokensUp <= 0 && tokensDown <= 0) return;
	const cycleResetsAt = await resolveCycleResetsAt(db, window, resetsAt);
	await db
		.update(usagePeaks)
		.set({
			tokensUp: sql`${usagePeaks.tokensUp} + ${tokensUp}`,
			tokensDown: sql`${usagePeaks.tokensDown} + ${tokensDown}`,
		})
		.where(
			and(
				eq(usagePeaks.window, window),
				eq(usagePeaks.resetsAt, cycleResetsAt),
				eq(usagePeaks.segment, 0),
			),
		);
}
