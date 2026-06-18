import { sql } from "drizzle-orm";
import type { RateLimits } from "../RateLimits";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

const WINDOWS = ["five_hour", "seven_day"] as const;

/**
 * Upsert the peak usage for each present rate-limit window, keyed by the window's
 * reset time, keeping the maximum percentage ever seen for that cycle
 * (`GREATEST`). Windows missing a `resets_at` or `used_percentage` are skipped;
 * with nothing to record the call is a no-op.
 */
export async function recordUsagePeak(
	db: Db,
	rateLimits: RateLimits,
): Promise<void> {
	const rows = WINDOWS.flatMap((window) => {
		const w = rateLimits[window];
		if (!w) return [];
		if (
			typeof w.resets_at !== "number" ||
			typeof w.used_percentage !== "number"
		)
			return [];
		return [
			{ window, resetsAt: w.resets_at, usedPercentage: w.used_percentage },
		];
	});
	if (rows.length === 0) return;
	await db
		.insert(usagePeaks)
		.values(rows)
		.onConflictDoUpdate({
			target: [usagePeaks.window, usagePeaks.resetsAt],
			set: {
				usedPercentage: sql`GREATEST(${usagePeaks.usedPercentage}, excluded.used_percentage)`,
			},
		});
}
