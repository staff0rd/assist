import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { items } from "./items";

export const comments = pgTable("comments", {
	id: integer().generatedByDefaultAsIdentity().primaryKey(),
	itemId: integer("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	idx: integer().notNull(),
	text: text().notNull(),
	phase: integer(),
	timestamp: text().notNull(),
	type: text().notNull().default("comment"),
});
