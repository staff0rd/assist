import { type AnyColumn, and, desc, eq, gte, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { type JobKind, jobRuns } from "./jobRuns";

export type JobRunTotals = {
	runs: number;
	runsByKind: Partial<Record<JobKind, number>>;
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	costUsd: number | null;
	failed: number;
	lastFailure: { kind: JobKind; startedAt: Date } | null;
};

const total = (column: AnyColumn) =>
	sql<number>`coalesce(sum(${column}), 0)`.mapWith(Number);

export async function jobRunTotals(db: Db, since: Date): Promise<JobRunTotals> {
	const inWindow = gte(jobRuns.startedAt, since);
	const [byKind, [sums], [lastFailure]] = await Promise.all([
		db
			.select({
				kind: jobRuns.kind,
				runs: sql<number>`count(*)`.mapWith(Number),
			})
			.from(jobRuns)
			.where(inWindow)
			.groupBy(jobRuns.kind),
		db
			.select({
				inputTokens: total(jobRuns.inputTokens),
				outputTokens: total(jobRuns.outputTokens),
				cacheReadTokens: total(jobRuns.cacheReadTokens),
				costUsd: sql<number | null>`sum(${jobRuns.costUsd})`.mapWith(Number),
				failed:
					sql<number>`count(*) filter (where ${jobRuns.status} = 'failed')`.mapWith(
						Number,
					),
			})
			.from(jobRuns)
			.where(inWindow),
		db
			.select({ kind: jobRuns.kind, startedAt: jobRuns.startedAt })
			.from(jobRuns)
			.where(and(inWindow, eq(jobRuns.status, "failed")))
			.orderBy(desc(jobRuns.startedAt))
			.limit(1),
	]);
	return {
		runs: byKind.reduce((sum, row) => sum + row.runs, 0),
		runsByKind: Object.fromEntries(byKind.map((row) => [row.kind, row.runs])),
		...sums,
		lastFailure: lastFailure ?? null,
	};
}
