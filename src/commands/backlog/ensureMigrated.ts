import type { BacklogDb } from "./BacklogDb";
import { migrateLocalBacklog } from "./migrateLocalBacklog";

const attempted = new Set<string>();

/**
 * Run the one-time local→Postgres migration at most once per origin per process.
 * Marked as attempted up-front so a failure does not retry (and recurse) within
 * the same process; a later process retries while the local file remains.
 */
export async function ensureMigrated(
	db: BacklogDb,
	dir: string,
	origin: string,
): Promise<void> {
	if (attempted.has(origin)) return;
	attempted.add(origin);
	await migrateLocalBacklog(db, dir, origin);
}
