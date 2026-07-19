import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { backups } from "./backups";
import { comments } from "./comments";
import { handovers } from "./handovers";
import { itemGitRefs } from "./itemGitRefs";
import { items } from "./items";
import { itemSubtasks } from "./itemSubtasks";
import { links } from "./links";
import { phaseCycleContext } from "./phaseCycleContext";
import { phaseSessions } from "./phaseSessions";
import { phaseUsage } from "./phaseUsage";
import { phaseUsageMessages } from "./phaseUsageMessages";
import { planPhases } from "./planPhases";
import { planTasks } from "./planTasks";
import { usagePeaks } from "./usagePeaks";

export { backups } from "./backups";
export { comments } from "./comments";
export { handovers } from "./handovers";
export { itemGitRefs } from "./itemGitRefs";
export { items } from "./items";
export { itemSubtasks } from "./itemSubtasks";
export { links } from "./links";
export { phaseCycleContext } from "./phaseCycleContext";
export { phaseSessions } from "./phaseSessions";
export { phaseUsage } from "./phaseUsage";
export { phaseUsageMessages } from "./phaseUsageMessages";
export { planPhases } from "./planPhases";
export { planTasks } from "./planTasks";
export { usagePeaks } from "./usagePeaks";

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
	itemGitRefs,
	metadata,
	feeds,
	handovers,
	usagePeaks,
	backups,
	phaseUsage,
	phaseUsageMessages,
	phaseCycleContext,
	phaseSessions,
};

export type ItemRow = typeof items.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
export type LinkRow = typeof links.$inferSelect;
export type PhaseRow = typeof planPhases.$inferSelect;
export type TaskRow = typeof planTasks.$inferSelect;
export type SubtaskRow = typeof itemSubtasks.$inferSelect;
export type PhaseUsageRow = typeof phaseUsage.$inferSelect;
export type PhaseSessionRow = typeof phaseSessions.$inferSelect;
export type GitRefRow = typeof itemGitRefs.$inferSelect;
