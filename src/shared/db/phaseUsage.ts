import { bigint, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";

/**
 * Per-phase cost for a backlog item run. One row per (itemId, phaseIdx), where
 * `phaseIdx` is 0-based to line up with {@link ./schema plan_phases.idx}.
 * `tokensUp`/`tokensDown` accumulate the status line's output/input token totals
 * as positive deltas; `activeMs` sums the running (non-waiting) intervals. The
 * `lastTotalIn`/`lastTotalOut` baselines are the last observed context-window
 * totals, so the next update can add only the positive growth. The `item_id`
 * foreign key (ON DELETE CASCADE) lives in the DDL in {@link ./ensureSchema},
 * which is the source of truth; Drizzle here is for typed queries only.
 */
export const phaseUsage = pgTable(
	"phase_usage",
	{
		itemId: integer("item_id").notNull(),
		phaseIdx: integer("phase_idx").notNull(),
		tokensUp: bigint("tokens_up", { mode: "number" }).notNull().default(0),
		tokensDown: bigint("tokens_down", { mode: "number" }).notNull().default(0),
		activeMs: bigint("active_ms", { mode: "number" }).notNull().default(0),
		lastTotalIn: bigint("last_total_in", { mode: "number" }),
		lastTotalOut: bigint("last_total_out", { mode: "number" }),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.phaseIdx] })],
);
