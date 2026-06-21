import { desc } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export type UsagePeakRow = typeof usagePeaks.$inferSelect;

/**
 * All recorded per-cycle usage peaks, newest first throughout: descending
 * `resetsAt`, then `window`, then `segment` descending so a reset cycle shows
 * its current post-reset value on top with the badged pre-reset peak beneath.
 */
export async function listUsagePeaks(db: Db): Promise<UsagePeakRow[]> {
	return db
		.select()
		.from(usagePeaks)
		.orderBy(
			desc(usagePeaks.resetsAt),
			usagePeaks.window,
			desc(usagePeaks.segment),
		);
}
