import { sql } from "drizzle-orm";
import type { UsageWindowKey } from "../usageWindowKey";
import { applyReading } from "./applyReading";
import type { BacklogDatabase, Db } from "./Db";
import { resolveCycleResetsAt } from "./resolveCycleResetsAt";

// why: serialise every caller for this window so cycle resolution and the read-compare-write stay atomic across concurrent fire-and-forget agent reports; the lock releases on commit.
const lock = (tx: BacklogDatabase, window: UsageWindowKey) =>
	tx.execute(
		sql`SELECT pg_advisory_xact_lock(hashtextextended(${`usage-peak:${window}`}, 0))`,
	);

/**
 * Record one window's latest reading against its current cycle. why: readings
 * carry no timestamp and concurrent agents report out of order, so robustness
 * rests on a non-obvious invariant — a cycle's segment peaks stay strictly
 * decreasing, letting a reading that climbs back to a recorded peak expose the
 * segments below it as stale noise (which {@link reconcile} collapses) rather
 * than resets. The read-compare-write runs under a window-scoped advisory
 * {@link lock} so concurrent callers serialise instead of racing, and a
 * jittered `resetsAt` lands on its already-recorded cycle via
 * {@link resolveCycleResetsAt}.
 *
 * A reading landing at or after `resetsAt` belongs to the next cycle (which
 * reports a fresh `resets_at`), so it is dropped: recording it would stamp a
 * segment past the window's reset and open a spurious reset against the
 * already-expired cycle. `now` is injectable for tests; production passes the
 * wall clock in seconds.
 */
export async function recordWindowPeak(
	db: Db,
	window: UsageWindowKey,
	resetsAt: number,
	usedPercentage: number,
	now: number = Math.floor(Date.now() / 1000),
): Promise<void> {
	if (now >= resetsAt) return;
	await db.transaction(async (tx) => {
		await lock(tx, window);
		const cycleResetsAt = await resolveCycleResetsAt(tx, window, resetsAt);
		await applyReading({ tx, window, resetsAt: cycleResetsAt }, usedPercentage);
	});
}

export { RESET_DROP_THRESHOLD } from "./applyReading";
