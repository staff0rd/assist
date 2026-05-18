import { cachedReviewerResult } from "./cachedReviewerResult";
import { ensureCodexAvailable } from "./ensureCodexAvailable";
import type { ReviewerResult } from "./runStreamingChild";

export type CodexPlan =
	| { kind: "cached"; cached: ReviewerResult }
	| { kind: "run" }
	| { kind: "skipped" };

export async function planCodexReviewer(codexPath: string): Promise<CodexPlan> {
	const cached = cachedReviewerResult("codex", codexPath);
	if (cached) return { kind: "cached", cached };
	const status = await ensureCodexAvailable();
	if (status === "available") return { kind: "run" };
	return { kind: "skipped" };
}

export function skippedCodexResult(outputPath: string): ReviewerResult {
	return { name: "codex", outputPath, exitCode: 0, stderr: "" };
}
