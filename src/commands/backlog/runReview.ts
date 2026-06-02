import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import type { BacklogItem, PlanPhase } from "./types";

export async function runReview(
	item: BacklogItem,
	fallbackPlan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
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
	return reviewResult >= 0;
}
