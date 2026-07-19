import {
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { items } from "./items";

export const phaseSessions = pgTable(
	"phase_sessions",
	{
		itemId: integer("item_id")
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		phaseIdx: integer("phase_idx").notNull(),
		claudeSessionId: text("claude_session_id").notNull(),
		hostname: text().notNull(),
		osUser: text("os_user").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		primaryKey({
			columns: [t.itemId, t.phaseIdx, t.claudeSessionId],
		}),
	],
);
