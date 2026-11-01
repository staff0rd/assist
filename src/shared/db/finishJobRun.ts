import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "./Db";
import { type JobStatus, jobRuns } from "./jobRuns";

type JobRunResult = {
	status: Exclude<JobStatus, "running">;
	finishedAt: Date;
	durationMs: number;
	model?: string | null;
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	cacheWriteTokens: number;
	costUsd: number | null;
	detail: string;
};

export async function finishJobRun(
	db: BacklogDatabase,
	id: number,
	result: JobRunResult,
): Promise<void> {
	await db.update(jobRuns).set(result).where(eq(jobRuns.id, id));
}
