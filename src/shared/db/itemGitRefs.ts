import {
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { items } from "./items";

export const itemGitRefs = pgTable(
	"item_git_refs",
	{
		itemId: integer("item_id")
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		kind: text().notNull(),
		ref: text().notNull(),
		title: text(),
		url: text(),
		state: text(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.kind, t.ref] })],
);
