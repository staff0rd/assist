import { jsonb, pgTable, smallint, timestamp } from "drizzle-orm/pg-core";

export const userConfig = pgTable("user_config", {
	id: smallint().primaryKey().default(1),
	config: jsonb().$type<Record<string, unknown>>().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
