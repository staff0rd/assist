import { bigint, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * One row per successful `assist backup`, recording when the dump was written,
 * where it landed, its size in bytes, and how long it took (`durationMs`, null
 * on rows written before duration was tracked). Mirrors the DDL in
 * {@link ./ensureSchema}.
 */
export const backups = pgTable("backups", {
	id: integer().generatedByDefaultAsIdentity().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	filePath: text("file_path").notNull(),
	sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
	durationMs: integer("duration_ms"),
});
