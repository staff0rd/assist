import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { applyReading, type Cycle } from "./applyReading";

// why: serialise every caller for this cycle so the read-compare-write stays atomic across concurrent fire-and-forget agent reports; the lock releases on commit.
const lock = ({ tx, window, resetsAt }: Cycle) =>
	tx.execute(
		sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${window}:${resetsAt}`}, 0))`,
	);

/**
 * Record one window's latest reading against its current cycle. why: readings
 * carry no timestamp and concurrent agents report out of order, so robustness
 * rests on a non-obvious invariant — a cycle's segment peaks stay strictly
 * decreasing, letting a reading that climbs back to a recorded peak expose the
 * segments below it as stale noise (which {@link reconcile} collapses) rather
 * than resets. The read-compare-write runs under a cycle-scoped advisory
 * {@link lock} so concurrent callers serialise instead of racing.
 */
export async function recordWindowPeak(
	db: Db,
	window: "five_hour" | "seven_day",
	resetsAt: number,
	usedPercentage: number,
): Promise<void> {
	await db.transaction(async (tx) => {
		const c: Cycle = { tx, window, resetsAt };
		await lock(c);
		await applyReading(c, usedPercentage);
	});
}

export { RESET_DROP_THRESHOLD } from "./applyReading";
