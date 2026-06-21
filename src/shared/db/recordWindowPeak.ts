import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

// why: usage only climbs within a cycle, so a drop past this margin below the recorded peak signals a mid-cycle quota reset rather than reporting jitter.
const RESET_DROP_THRESHOLD = 1;

/**
 * Record one window's latest reading against its current cycle. Within a
 * segment the maximum percentage wins (`GREATEST`); a drop past
 * {@link RESET_DROP_THRESHOLD} below the active peak freezes that segment with
 * `resetDetected` set and opens the next segment at the post-reset value, so
 * the pre-reset peak survives instead of being overwritten.
 */
export async function recordWindowPeak(
	db: Db,
	window: "five_hour" | "seven_day",
	resetsAt: number,
	usedPercentage: number,
): Promise<void> {
	const [active] = await db
		.select()
		.from(usagePeaks)
		.where(
			and(eq(usagePeaks.window, window), eq(usagePeaks.resetsAt, resetsAt)),
		)
		.orderBy(desc(usagePeaks.segment))
		.limit(1);

	if (!active) {
		await db
			.insert(usagePeaks)
			.values({ window, resetsAt, segment: 0, usedPercentage });
		return;
	}

	const matchActive = and(
		eq(usagePeaks.window, window),
		eq(usagePeaks.resetsAt, resetsAt),
		eq(usagePeaks.segment, active.segment),
	);

	if (usedPercentage < active.usedPercentage - RESET_DROP_THRESHOLD) {
		await db.update(usagePeaks).set({ resetDetected: true }).where(matchActive);
		await db.insert(usagePeaks).values({
			window,
			resetsAt,
			segment: active.segment + 1,
			usedPercentage,
		});
		return;
	}

	await db
		.update(usagePeaks)
		.set({
			usedPercentage: sql`GREATEST(${usagePeaks.usedPercentage}, ${usedPercentage})`,
		})
		.where(matchActive);
}
