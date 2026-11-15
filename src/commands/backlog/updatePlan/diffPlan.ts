import type { PlanPhase } from "../types";
import { classifyPhase } from "./classifyPhase";
import { isCompleted } from "./isCompleted";
import { matchStoredPhases } from "./matchStoredPhases";
import { differingDependsOn } from "../dependsOn/differingDependsOn";
import type { PlanUpdatePhase } from "./planUpdateSchema";
import type { DiffPhase, PlanDiff } from "./types";

function fromStored(phase: PlanPhase, idx: number): DiffPhase {
	return {
		name: phase.name,
		tasks: phase.tasks.map((t) => t.task),
		manualChecks: phase.manualChecks ?? [],
		dependsOn: differingDependsOn(phase.dependsOn, idx + 1),
	};
}

export function diffPlan(
	storedPlan: PlanPhase[] | undefined,
	payloadPhases: PlanUpdatePhase[],
	currentPhase: number | undefined,
): PlanDiff {
	const stored = (storedPlan ?? []).map(fromStored);
	const payload: DiffPhase[] = payloadPhases.map((phase, idx) => ({
		name: phase.name,
		tasks: phase.tasks,
		manualChecks: phase.manualChecks,
		dependsOn: differingDependsOn(phase.dependsOn, idx + 1),
	}));

	const matches = matchStoredPhases(payload, stored);
	const phases = payload.map((phase, idx) =>
		classifyPhase(phase, idx, matches[idx], stored, currentPhase),
	);

	const matched = new Set(matches.filter((idx) => idx !== undefined));
	const removed = stored.flatMap((phase, idx) =>
		matched.has(idx)
			? []
			: [
					{
						phase,
						previousPosition: idx + 1,
						wasCompleted: isCompleted(idx + 1, currentPhase),
					},
				],
	);

	return { phases, removed };
}
