import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { items } from "./items";

export const itemSubtasks = pgTable(
	"item_subtasks",
	{
		itemId: integer("item_id")
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		idx: integer().notNull(),
		title: text().notNull(),
		description: text(),
		status: text().notNull().default("todo"),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.idx] })],
);
