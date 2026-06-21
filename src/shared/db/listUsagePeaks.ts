import { desc } from "drizzle-orm";
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
export async function listUsagePeaks(db: Db): Promise<UsagePeakRow[]> {
	return db
		.select()
		.from(usagePeaks)
		.orderBy(
			desc(usagePeaks.resetsAt),
			usagePeaks.window,
			desc(usagePeaks.createdAt),
			desc(usagePeaks.segment),
		);
}
