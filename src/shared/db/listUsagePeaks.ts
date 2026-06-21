import { desc } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export type UsagePeakRow = typeof usagePeaks.$inferSelect;

/**
 * All recorded per-cycle usage peaks, newest cycle first (descending
 * `resetsAt`), then `window`, then `segment` ascending so a reset cycle's rows
 * read as a timeline — the badged pre-reset peak before its post-reset
 * continuation.
 */
export async function listUsagePeaks(db: Db): Promise<UsagePeakRow[]> {
	return db
		.select()
		.from(usagePeaks)
		.orderBy(desc(usagePeaks.resetsAt), usagePeaks.window, usagePeaks.segment);
}
