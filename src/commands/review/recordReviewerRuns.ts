import type { BacklogDatabase } from "../../shared/db/Db";
import { getDb } from "../../shared/db/getDb";
import { recordJobRun } from "../../shared/db/recordJobRun";
import type { ReviewerResult } from "./runStreamingChild";

export type ReviewJobTarget = { repo: string; prNumber: number };

function toJobRun(
	result: ReviewerResult,
	target: ReviewJobTarget,
	startedAt: Date,
	now: Date,
) {
	const durationMs = result.elapsedMs ?? now.getTime() - startedAt.getTime();
	const failed = result.exitCode !== 0;
	return {
		kind: "review" as const,
		trigger: "manual" as const,
		model: result.model ?? null,
		startedAt,
		finishedAt: new Date(startedAt.getTime() + durationMs),
		durationMs,
		inputTokens: result.usage?.input ?? 0,
		outputTokens: result.usage?.output ?? 0,
		cacheReadTokens: result.usage?.cacheRead ?? 0,
		cacheWriteTokens: result.usage?.cacheWrite ?? 0,
		costUsd: null,
		status: failed ? ("failed" as const) : ("finished" as const),
		detail: failed ? `exit ${result.exitCode}` : null,
		repo: target.repo,
		prNumber: target.prNumber,
		reviewer: result.name,
	};
}

export async function recordReviewerRuns(
	fresh: ReviewerResult[],
	target: ReviewJobTarget,
	startedAt: Date,
	openDb: () => Promise<BacklogDatabase> = getDb,
): Promise<void> {
	if (fresh.length === 0) return;
	const now = new Date();
	try {
		const db = await openDb();
		for (const result of fresh)
			await recordJobRun(db, toJobRun(result, target, startedAt, now));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Could not record reviewer runs: ${message}`);
	}
}
