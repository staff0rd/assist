import { count, desc } from "drizzle-orm";
import type { Db } from "./Db";
import { jobRuns } from "./jobRuns";

export type JobRunRow = typeof jobRuns.$inferSelect;

export async function listJobRuns(
	db: Db,
	range: { limit: number; offset: number },
): Promise<{ rows: JobRunRow[]; total: number }> {
	const [rows, [{ total }]] = await Promise.all([
		db
			.select()
			.from(jobRuns)
			.orderBy(desc(jobRuns.startedAt), desc(jobRuns.id))
			.limit(range.limit)
			.offset(range.offset),
		db.select({ total: count() }).from(jobRuns),
	]);
	return { rows, total };
}
