import { and, eq, gt } from "drizzle-orm";
import type { BacklogDatabase } from "./Db";
import { usagePeaks } from "./schema";

type Window = "five_hour" | "seven_day";

export type Cycle = { tx: BacklogDatabase; window: Window; resetsAt: number };

type Segment = typeof usagePeaks.$inferSelect;

// why: usage only climbs within a cycle, so a drop past this margin below the active peak signals a mid-cycle quota reset rather than reporting jitter.
const RESET_DROP_THRESHOLD = 1;

const at = ({ window, resetsAt }: Cycle, segment?: number) =>
	segment === undefined
		? and(eq(usagePeaks.window, window), eq(usagePeaks.resetsAt, resetsAt))
		: and(
				eq(usagePeaks.window, window),
				eq(usagePeaks.resetsAt, resetsAt),
				eq(usagePeaks.segment, segment),
			);

const insertSegment = (c: Cycle, segment: number, usedPercentage: number) =>
	c.tx.insert(usagePeaks).values({
		window: c.window,
		resetsAt: c.resetsAt,
		segment,
		usedPercentage,
	});

const load = (c: Cycle): Promise<Segment[]> =>
	c.tx.select().from(usagePeaks).where(at(c)).orderBy(usagePeaks.segment);

export async function applyReading(
	c: Cycle,
	usedPercentage: number,
): Promise<void> {
	const segments = await load(c);
	if (segments.length === 0) await insertSegment(c, 0, usedPercentage);
	else await reconcile(c, segments, usedPercentage);
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

export { RESET_DROP_THRESHOLD };
