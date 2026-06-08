import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import type { BacklogItem, PlanPhase } from "./types";

type ReviewResult =
	| { kind: "done" }
	| { kind: "abort" }
	| { kind: "rewind"; targetPhase: number };

export async function runReview(
	item: BacklogItem,
	fallbackPlan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<ReviewResult> {
	// Review runs only after every authored phase — including ones added mid-run —
	// is complete, so resolve the live plan to place it after the latest phases.
	const plan = (await reloadPlan(item.id)) ?? fallbackPlan;
	const reviewPhase = buildReviewPhase();
	const allPhases = [...plan, reviewPhase];
	const reviewResult = await executePhase(
		item,
		plan.length,
		allPhases,
		spawnOptions,
	);
	if (reviewResult < 0) return { kind: "abort" };
	// The review agent can rewind to an earlier authored phase, which resolves to
	// a target index below the review phase. Anything else means review passed.
	if (reviewResult < plan.length) {
		return { kind: "rewind", targetPhase: reviewResult };
	}
	return { kind: "done" };
}
