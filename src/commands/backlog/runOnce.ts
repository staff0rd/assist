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
): Promise<ReviewResult | { kind: "fail" } | { kind: "paused" }> {
	// why: resume only reaches the review when the restart interrupted the review.
	const reviewOptions =
		startPhase >= plan.length
			? spawnOptions
			: withoutResumeSession(spawnOptions);
	const phases = await runPhases(item, startPhase, plan, spawnOptions);
	if (phases.kind === "fail") return { kind: "fail" };
	if (phases.kind === "paused") return { kind: "paused" };
	return runReview(item, plan, reviewOptions);
}
