import {
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";
import { planPhases } from "./planPhases";

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
