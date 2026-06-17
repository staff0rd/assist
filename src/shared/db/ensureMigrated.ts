import { migrateLocalBacklog } from "../../commands/backlog/migrateLocalBacklog";
import type { Db } from "./Db";

const attempted = new Set<string>();

/**
 * Run the one-time local→Postgres migration at most once per origin per process.
 * Marked as attempted up-front so a failure does not retry (and recurse) within
 * the same process; a later process retries while the local file remains.
 */
export async function ensureMigrated(
	orm: Db,
	dir: string,
	origin: string,
): Promise<void> {
	if (attempted.has(origin)) return;
	attempted.add(origin);
	await migrateLocalBacklog(orm, dir, origin);
}
