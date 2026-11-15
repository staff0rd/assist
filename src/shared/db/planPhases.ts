import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { items } from "./items";

export const planPhases = pgTable(
	"plan_phases",
	{
		itemId: integer("item_id")
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		idx: integer().notNull(),
		name: text().notNull(),
		manualChecks: text("manual_checks"),
		/** 0-based idx of the phases this one waits for; null means the previous phase. */
		dependsOn: integer("depends_on").array(),
		/** "running" while a parallel phase's own session works on it, "done" once landed, "failed" if it aborted; null is pending. */
		runState: text("run_state"),
		/** Identifies the parallel phase session that owns a running phase, so a cancelled one can tell it was superseded. */
		runToken: text("run_token"),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.idx] })],
);
