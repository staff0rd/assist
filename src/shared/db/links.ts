import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { items } from "./items";

export const links = pgTable(
	"links",
	{
		itemId: integer("item_id")
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		type: text().notNull(),
		targetId: integer("target_id").notNull(),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.type, t.targetId] })],
);
