import { differingDependsOn } from "../../../dependsOn/differingDependsOn";
import type { PhaseRuns, PlanPhase } from "../types";
import type { PhaseDependency } from "./DependsOnRow";
import { phaseStatus } from "./sessionsByPhase";

/** The phases a card's Depends on row lists, or undefined when it is just the previous phase. */
export function phaseDependencies(
	phase: PlanPhase,
	index: number,
	currentPhase: number | undefined,
	runs?: PhaseRuns,
): PhaseDependency[] | undefined {
	return differingDependsOn(phase.dependsOn, index + 1)?.map((number) => ({
		number,
		status: phaseStatus(number - 1, currentPhase, runs),
	}));
}
