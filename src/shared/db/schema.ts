import {
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";
import { backups } from "./backups";
import { handovers } from "./handovers";
import { items } from "./items";
import { itemSubtasks } from "./itemSubtasks";
import { phaseUsage } from "./phaseUsage";
import { usagePeaks } from "./usagePeaks";

export { backups } from "./backups";
export { handovers } from "./handovers";
export { items } from "./items";
export { itemSubtasks } from "./itemSubtasks";
export { phaseUsage } from "./phaseUsage";
export { usagePeaks } from "./usagePeaks";

/**
 * Drizzle schema for the backlog store. This mirrors the DDL in
 * {@link ./ensureSchema}, which remains the source of truth for actually
 * creating the tables — Drizzle is used for type-safe query building, not (yet)
 * for migrations, so the column/key definitions here exist to describe the
 * existing tables rather than to generate them.
 */
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

export const planTasks = pgTable(
	"plan_tasks",
	{
		itemId: integer("item_id").notNull(),
		phaseIdx: integer("phase_idx").notNull(),
		idx: integer().notNull(),
		task: text().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.itemId, t.phaseIdx, t.idx] }),
		foreignKey({
			columns: [t.itemId, t.phaseIdx],
			foreignColumns: [planPhases.itemId, planPhases.idx],
		}).onDelete("cascade"),
	],
);

export const metadata = pgTable("metadata", {
	key: text().primaryKey(),
	value: text().notNull(),
});

export const feeds = pgTable("feeds", {
	id: integer().generatedByDefaultAsIdentity().primaryKey(),
	url: text().notNull().unique(),
});

/** All backlog tables, passed to the Drizzle client as its schema. */
export const schema = {
	items,
	comments,
	links,
	planPhases,
	planTasks,
	itemSubtasks,
	metadata,
	feeds,
	handovers,
	usagePeaks,
	backups,
	phaseUsage,
};

export type ItemRow = typeof items.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
export type LinkRow = typeof links.$inferSelect;
export type PhaseRow = typeof planPhases.$inferSelect;
export type TaskRow = typeof planTasks.$inferSelect;
export type SubtaskRow = typeof itemSubtasks.$inferSelect;
export type PhaseUsageRow = typeof phaseUsage.$inferSelect;
