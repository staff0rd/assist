import {
	bigint,
	doublePrecision,
	integer,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";

export const phaseCycleContext = pgTable(
	"phase_cycle_context",
	{
		itemId: integer("item_id").notNull(),
		phaseIdx: integer("phase_idx").notNull(),
		window: text().$type<"five_hour" | "seven_day">().notNull(),
		resetsAt: bigint("resets_at", { mode: "number" }).notNull(),
		peakContextPct: doublePrecision("peak_context_pct").notNull().default(0),
	},
	(t) => [
		primaryKey({
			columns: [t.itemId, t.phaseIdx, t.window, t.resetsAt],
		}),
	],
);
