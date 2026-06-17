import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const handovers = pgTable(
	"handovers",
	{
		id: integer().generatedByDefaultAsIdentity().primaryKey(),
		origin: text().notNull(),
		summary: text().notNull(),
		content: text().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		recalledAt: timestamp("recalled_at", { withTimezone: true }),
	},
	(t) => [index("handovers_origin_idx").on(t.origin)],
);
