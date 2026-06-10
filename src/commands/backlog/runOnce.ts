import {
	type SpawnClaudeOptions,
	withoutResumeSession,
} from "../../shared/spawnClaude";
import { runPhases } from "./runPhases";
import { type ReviewResult, runReview } from "./runReview";
import type { BacklogItem, PlanPhase } from "./types";

export async function runOnce(
	item: BacklogItem,
	startPhase: number,
	plan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<ReviewResult | { kind: "fail" }> {
	// why: resume only reaches the review when the restart interrupted the review.
	const reviewOptions =
		startPhase >= plan.length
			? spawnOptions
			: withoutResumeSession(spawnOptions);
	if (!(await runPhases(item, startPhase, plan, spawnOptions)))
		return { kind: "fail" };
	return runReview(item, plan, reviewOptions);
}
