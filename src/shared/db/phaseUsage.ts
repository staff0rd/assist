import {
	bigint,
	doublePrecision,
	integer,
	pgTable,
	primaryKey,
} from "drizzle-orm/pg-core";

export const phaseUsage = pgTable(
	"phase_usage",
	{
		itemId: integer("item_id").notNull(),
		phaseIdx: integer("phase_idx").notNull(),
		tokensUp: bigint("tokens_up", { mode: "number" }).notNull().default(0),
		tokensDown: bigint("tokens_down", { mode: "number" }).notNull().default(0),
		activeMs: bigint("active_ms", { mode: "number" }).notNull().default(0),
		peakContextPct: doublePrecision("peak_context_pct").notNull().default(0),
		lastTotalIn: bigint("last_total_in", { mode: "number" }),
		lastTotalOut: bigint("last_total_out", { mode: "number" }),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.phaseIdx] })],
);
