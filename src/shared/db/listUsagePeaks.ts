import { desc } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export type UsagePeakRow = typeof usagePeaks.$inferSelect;

/**
 * All recorded per-cycle usage peaks, newest cycle first (descending
 * `resetsAt`), with `window` as a stable tiebreak so 5h/7d rows for the same
 * reset time keep a deterministic order.
 */
export async function listUsagePeaks(db: Db): Promise<UsagePeakRow[]> {
	return db
		.select()
		.from(usagePeaks)
		.orderBy(desc(usagePeaks.resetsAt), usagePeaks.window);
}
