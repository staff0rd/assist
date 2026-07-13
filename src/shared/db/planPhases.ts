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
	},
	(t) => [primaryKey({ columns: [t.itemId, t.idx] })],
);
