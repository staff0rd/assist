import { differingDependsOn } from "../../../dependsOn/differingDependsOn";
import type { PlanPhase } from "../types";

/** "after 2" for a phase whose dependencies differ from the previous phase, else undefined. */
export function dependsOnCaption(
	phase: PlanPhase,
	index: number,
): string | undefined {
	const dependsOn = differingDependsOn(phase.dependsOn, index + 1);
	if (!dependsOn) return undefined;
	return dependsOn.length > 0
		? `after ${dependsOn.join(", ")}`
		: "no dependencies";
}
