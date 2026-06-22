import { and, eq, gt, sql } from "drizzle-orm";
import type { BacklogDatabase, Db } from "./Db";
import { usagePeaks } from "./schema";

// why: usage only climbs within a cycle, so a drop past this margin below the active peak signals a mid-cycle quota reset rather than reporting jitter.
const RESET_DROP_THRESHOLD = 1;

type Window = "five_hour" | "seven_day";
type Segment = typeof usagePeaks.$inferSelect;

type Cycle = { tx: BacklogDatabase; window: Window; resetsAt: number };

const at = ({ window, resetsAt }: Cycle, segment?: number) =>
	segment === undefined
		? and(eq(usagePeaks.window, window), eq(usagePeaks.resetsAt, resetsAt))
		: and(
				eq(usagePeaks.window, window),
				eq(usagePeaks.resetsAt, resetsAt),
				eq(usagePeaks.segment, segment),
			);

// why: serialise every caller for this cycle so the read-compare-write stays atomic across concurrent fire-and-forget agent reports; the lock releases on commit.
const lock = ({ tx, window, resetsAt }: Cycle) =>
	tx.execute(
		sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${window}:${resetsAt}`}, 0))`,
	);

const load = (c: Cycle): Promise<Segment[]> =>
	c.tx.select().from(usagePeaks).where(at(c)).orderBy(usagePeaks.segment);

const insertSegment = (c: Cycle, segment: number, usedPercentage: number) =>
	c.tx.insert(usagePeaks).values({
		window: c.window,
		resetsAt: c.resetsAt,
		segment,
		usedPercentage,
	});

/**
 * Collapse the false segments below {@link reached} back into it: usage climbed
 * back to a peak the cycle already recorded, so the drops beneath it were
 * stale/out-of-order readings, not resets. The deeper segments are dropped and
 * {@link reached} takes the new (higher) value, clear of any `resetDetected`.
 */
async function collapseToReached(
	c: Cycle,
	reached: Segment,
	usedPercentage: number,
): Promise<void> {
	await c.tx
		.delete(usagePeaks)
		.where(and(at(c), gt(usagePeaks.segment, reached.segment)));
	await c.tx
		.update(usagePeaks)
		.set({ usedPercentage, resetDetected: false })
		.where(at(c, reached.segment));
}

async function openReset(
	c: Cycle,
	active: Segment,
	usedPercentage: number,
): Promise<void> {
	await c.tx
		.update(usagePeaks)
		.set({ resetDetected: true })
		.where(at(c, active.segment));
	await insertSegment(c, active.segment + 1, usedPercentage);
}

async function reconcile(
	c: Cycle,
	segments: Segment[],
	usedPercentage: number,
): Promise<void> {
	const reached = segments.find((s) => usedPercentage >= s.usedPercentage);
	if (reached) {
		await collapseToReached(c, reached, usedPercentage);
		return;
	}
	const active = segments[segments.length - 1];
	if (usedPercentage < active.usedPercentage - RESET_DROP_THRESHOLD) {
		await openReset(c, active, usedPercentage);
	}
}

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
	window: Window,
	resetsAt: number,
	usedPercentage: number,
): Promise<void> {
	await db.transaction(async (tx) => {
		const c: Cycle = { tx, window, resetsAt };
		await lock(c);
		const segments = await load(c);
		if (segments.length === 0) await insertSegment(c, 0, usedPercentage);
		else await reconcile(c, segments, usedPercentage);
	});
}

export { RESET_DROP_THRESHOLD };
