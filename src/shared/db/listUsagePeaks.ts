import { count, desc } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export type UsagePeakRow = typeof usagePeaks.$inferSelect;

/**
 * All recorded usage peaks, newest cycle first (descending `resetsAt`) with
 * `window` as a stable cross-window tiebreak, then `createdAt` descending so a
 * cycle's segments stack newest-first by when each reading landed — the current
 * post-reset value on top, earlier (badged) pre-reset peaks beneath. `segment`
 * is a final tiebreak should two readings share a timestamp.
 */
export async function listUsagePeaks(
	db: Db,
	paging?: { limit: number; offset: number },
): Promise<UsagePeakRow[]> {
	const query = db
		.select()
		.from(usagePeaks)
		.orderBy(
			desc(usagePeaks.resetsAt),
			usagePeaks.window,
			desc(usagePeaks.createdAt),
			desc(usagePeaks.segment),
		);
	if (paging) {
		return query.limit(paging.limit).offset(paging.offset);
	}
	return query;
}

export async function countUsagePeaks(db: Db): Promise<number> {
	const [row] = await db.select({ value: count() }).from(usagePeaks);
	return row?.value ?? 0;
}
