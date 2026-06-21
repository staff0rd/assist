import { desc } from "drizzle-orm";
import type { Db } from "./Db";
import { backups } from "./schema";

export type BackupRow = typeof backups.$inferSelect;

/**
 * All recorded backups, newest first (descending `createdAt`, with `id` as a
 * stable tiebreak should two rows share a timestamp).
 */
export async function listBackups(db: Db): Promise<BackupRow[]> {
	return db
		.select()
		.from(backups)
		.orderBy(desc(backups.createdAt), desc(backups.id));
}
