import {
	bigint,
	boolean,
	doublePrecision,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

/**
 * Per-reset-cycle peak Claude usage. `window` is the rate-limit bucket
 * (`five_hour`/`seven_day`), `resetsAt` identifies the cycle by the bucket's
 * reset time, and `usedPercentage` is the maximum usage observed.
 *
 * A cycle can hold more than one row: usage normally only climbs, so a sharp
 * drop while `resetsAt` is unchanged signals a mid-cycle quota reset. When that
 * happens the existing row is frozen with `resetDetected` set (preserving the
 * pre-reset peak) and a fresh row is opened at the next `segment`. So a reset
 * leaves two rows for one cycle — the badged pre-reset peak and the post-reset
 * continuation — instead of overwriting the peak. Segment peaks therefore stay
 * strictly decreasing within a cycle; a reading that climbs back to a peak the
 * cycle already recorded exposes the segments below it as stale/out-of-order
 * noise rather than resets, and {@link ./recordWindowPeak} collapses them.
 * `createdAt` records when each row's first reading landed, so a reset cycle
 * reads as a timeline. Mirrors the DDL in {@link ./ensureSchema}.
 */
export const usagePeaks = pgTable(
	"usage_peaks",
	{
		window: text().$type<"five_hour" | "seven_day">().notNull(),
		resetsAt: bigint("resets_at", { mode: "number" }).notNull(),
		segment: integer().notNull().default(0),
		usedPercentage: doublePrecision("used_percentage").notNull(),
		resetDetected: boolean("reset_detected").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.window, t.resetsAt, t.segment] })],
);
