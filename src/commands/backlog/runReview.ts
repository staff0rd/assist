import {
	type SpawnClaudeOptions,
	withoutResumeSession,
} from "../../shared/spawnClaude";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import type { BacklogItem, PlanPhase } from "./types";

export type ReviewResult =
	| { kind: "done" }
	| { kind: "abort" }
	| { kind: "incomplete" }
	| { kind: "rewind"; targetPhase: number; plan: PlanPhase[] };

export async function runReview(
	item: BacklogItem,
	fallbackPlan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<ReviewResult> {
	const plan = (await reloadPlan(item.id)) ?? fallbackPlan;
	const reviewPhase = buildReviewPhase();
	const allPhases = [...plan, reviewPhase];

	let reviewOptions = spawnOptions;
	while (true) {
		const outcome = await executePhase(
			item,
			plan.length,
			allPhases,
			reviewOptions,
		);
		reviewOptions = withoutResumeSession(reviewOptions);

		if (outcome.kind === "abort") return { kind: "abort" };
		if (outcome.kind === "rewind")
			return { kind: "rewind", targetPhase: outcome.targetPhase, plan };
		if (outcome.kind === "skip") return { kind: "incomplete" };
		if (outcome.kind === "advance") return { kind: "done" };
	}
}
