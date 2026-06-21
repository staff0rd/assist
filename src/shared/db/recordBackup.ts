import type { Db } from "./Db";
import { backups } from "./schema";

/** Record one successful backup, inserting a single row. */
export async function recordBackup(
	db: Db,
	{
		filePath,
		sizeBytes,
		durationMs,
	}: { filePath: string; sizeBytes: number; durationMs: number },
): Promise<void> {
	await db.insert(backups).values({ filePath, sizeBytes, durationMs });
}
