import { boolean, index, integer, pgTable, text } from "drizzle-orm/pg-core";

/**
 * Backlog items. Mirrors the DDL in {@link ./ensureSchema}, which remains the
 * source of truth for creating the table; Drizzle here is for typed queries.
 */
export const items = pgTable(
	"items",
	{
		id: integer().generatedByDefaultAsIdentity().primaryKey(),
		origin: text().notNull(),
		type: text().notNull().default("story"),
		name: text().notNull(),
		description: text(),
		acceptanceCriteria: text("acceptance_criteria").notNull().default("[]"),
		status: text().notNull().default("todo"),
		currentPhase: integer("current_phase"),
		starred: boolean().notNull().default(false),
		jiraKey: text("jira_key"),
	},
	(t) => [index("items_origin_idx").on(t.origin)],
);
