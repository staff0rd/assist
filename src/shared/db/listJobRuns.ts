import { and, count, desc, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { type JobKind, type JobTrigger, jobRuns } from "./jobRuns";

export type JobRunRow = typeof jobRuns.$inferSelect;

export type JobRunFilters = { kind?: JobKind; trigger?: JobTrigger };

export async function listJobRuns(
	db: Db,
	range: { limit: number; offset: number },
	filters: JobRunFilters = {},
): Promise<{ rows: JobRunRow[]; total: number }> {
	const where = and(
		filters.kind ? eq(jobRuns.kind, filters.kind) : undefined,
		filters.trigger ? eq(jobRuns.trigger, filters.trigger) : undefined,
	);
	const [rows, [{ total }]] = await Promise.all([
		db
			.select()
			.from(jobRuns)
			.where(where)
			.orderBy(desc(jobRuns.startedAt), desc(jobRuns.id))
			.limit(range.limit)
			.offset(range.offset),
		db.select({ total: count() }).from(jobRuns).where(where),
	]);
	return { rows, total };
}
