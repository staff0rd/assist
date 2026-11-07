import { emitActivity } from "../../shared/emitActivity";
import { harnessActivityFields } from "../../shared/harnessActivityFields";
import type { HarnessKind } from "../../shared/harnesses";
import { backlogPhaseActivity } from "./backlogPhaseActivity";
import type { BacklogItem, PlanPhase } from "./types";

export function reportPhaseActivity(
	item: BacklogItem,
	phaseNumber: number,
	totalPhases: number,
	phase: PlanPhase,
	claudeSessionId: string,
	harness?: HarnessKind,
	resumeSessionId?: string,
): void {
	emitActivity({
		...backlogPhaseActivity(item, phaseNumber, totalPhases, phase.name),
		...harnessActivityFields(harness, claudeSessionId, resumeSessionId),
	});
}
