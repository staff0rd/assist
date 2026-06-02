import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import type { BacklogItem, PlanPhase } from "./types";

export async function runPhases(
	item: BacklogItem,
	startPhase: number,
	plan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	let phaseIndex = startPhase;
	let currentPlan = plan;
	while (phaseIndex < currentPlan.length) {
		phaseIndex = await executePhase(
			item,
			phaseIndex,
			currentPlan,
			spawnOptions,
		);
		if (phaseIndex < 0) return false;
		// Re-resolve from the DB so phases added mid-run (e.g. appended to the end
		// while the last phase is executing) extend the loop instead of being
		// skipped in favour of the review phase.
		currentPlan = (await reloadPlan(item.id)) ?? currentPlan;
	}
	return true;
}
