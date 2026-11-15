import type { PlanPhase } from "../types";
import { phaseDependencies } from "./schedulePhases";

/** The 0-based phase at `idx` plus every later phase that transitively depends on it. */
export function dependentPhases(plan: PlanPhase[], idx: number): number[] {
	const closure = [idx];
	for (let later = idx + 1; later < plan.length; later++) {
		if (phaseDependencies(plan, later).some((dep) => closure.includes(dep)))
			closure.push(later);
	}
	return closure;
}
