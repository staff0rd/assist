import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text } from "drizzle-orm/pg-core";

/**
 * Backlog items. Mirrors the DDL; Drizzle here is for typed queries.
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
		githubIssue: text("github_issue"),
		priority: integer()
			.notNull()
			.default(sql`nextval('items_priority_seq')`),
	},
	(t) => [
		index("items_origin_idx").on(t.origin),
		index("items_origin_priority_idx").on(t.origin, t.priority),
	],
);
