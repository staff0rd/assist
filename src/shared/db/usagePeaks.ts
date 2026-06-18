import {
	bigint,
	doublePrecision,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";

/**
 * Per-reset-cycle peak Claude usage. One row per (window, cycle): `window` is the
 * rate-limit bucket (`five_hour`/`seven_day`), `resetsAt` identifies the cycle by
 * the bucket's reset time, and `usedPercentage` is the maximum usage observed in
 * that cycle. Mirrors the DDL in {@link ./ensureSchema}.
 */
export const usagePeaks = pgTable(
	"usage_peaks",
	{
		window: text().$type<"five_hour" | "seven_day">().notNull(),
		resetsAt: bigint("resets_at", { mode: "number" }).notNull(),
		usedPercentage: doublePrecision("used_percentage").notNull(),
	},
	(t) => [primaryKey({ columns: [t.window, t.resetsAt] })],
);
