import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const repoConfigs = pgTable("repo_configs", {
	repoKey: text("repo_key").primaryKey(),
	config: jsonb().$type<Record<string, unknown>>().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
