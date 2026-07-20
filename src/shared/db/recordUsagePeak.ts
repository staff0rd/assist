import type { RateLimits } from "../RateLimits";
import type { Db } from "./Db";
import { recordWindowPeak } from "./recordWindowPeak";

const WINDOWS = ["five_hour", "seven_day"] as const;

/**
 * Record the latest reading for each present rate-limit window against its
 * cycle (keyed by `resets_at`), delegating the per-window peak/reset bookkeeping
 * to {@link recordWindowPeak}. Windows missing a `resets_at` or
 * `used_percentage` are skipped. `now` (seconds) is injectable for tests and
 * defaults to the wall clock; it lets {@link recordWindowPeak} drop readings
 * that arrive after their cycle has already reset.
 */
export async function recordUsagePeak(
	db: Db,
	rateLimits: RateLimits,
	now: number = Math.floor(Date.now() / 1000),
): Promise<void> {
	for (const window of WINDOWS) {
		const w = rateLimits[window];
		if (
			!w ||
			typeof w.resets_at !== "number" ||
			typeof w.used_percentage !== "number"
		)
			continue;
		await recordWindowPeak(db, window, w.resets_at, w.used_percentage, now);
	}
}
