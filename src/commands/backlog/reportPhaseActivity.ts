import { emitActivity } from "../../shared/emitActivity";
import type { HarnessActivityIdentity } from "../../shared/harnessAdapters/types";
import { backlogPhaseActivity } from "./backlogPhaseActivity";
import type { BacklogItem, PlanPhase } from "./types";

export function reportPhaseActivity(
	item: BacklogItem,
	phaseNumber: number,
	totalPhases: number,
	phase: PlanPhase,
	identity: HarnessActivityIdentity,
): void {
	emitActivity({
		...backlogPhaseActivity(item, phaseNumber, totalPhases, phase.name),
		...identity,
	});
}
