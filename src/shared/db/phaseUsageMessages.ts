import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const phaseUsageMessages = pgTable(
	"phase_usage_messages",
	{
		itemId: integer("item_id").notNull(),
		phaseIdx: integer("phase_idx").notNull(),
		messageId: text("message_id").notNull(),
	},
	(t) => [primaryKey({ columns: [t.itemId, t.phaseIdx, t.messageId] })],
);
