import { withoutResumeSession } from "../../shared/spawnClaude";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import { reloadReviewPhase } from "./reloadReviewPhase";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";

export type ReviewResult =
	| { kind: "done" }
	| { kind: "abort" }
	| { kind: "incomplete" }
	| { kind: "rewind"; targetPhase: number; plan: PlanPhase[] };

export async function runReview(
	item: BacklogItem,
	fallbackPlan: PlanPhase[],
	spawnOptions?: BacklogRunOptions,
): Promise<ReviewResult> {
	const plan = (await reloadPlan(item.id)) ?? fallbackPlan;
	const allPhases = [...plan, await reloadReviewPhase(item.id)];

	let reviewOptions = spawnOptions;
	while (true) {
		const outcome = await executePhase(
			item,
			allPhases.length - 1,
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
