import type { BacklogItem, PlanPhase } from "../types";
import { phaseStatus } from "./sessionsByPhase";

/** "Running" or "Queued" for a phase while the run has phases in flight in parallel, else undefined. */
export function runCaption(
	item: BacklogItem,
	phase: PlanPhase,
	index: number,
): string | undefined {
	const running = item.runningPhases ?? [];
	if (running.length === 0) return undefined;
	if (running.includes(index + 1)) return "Running";
	if (phaseStatus(index, item.currentPhase, item) === "done") return undefined;
	const dependsOn = phase.dependsOn ?? (index > 0 ? [index] : []);
	const ready = dependsOn.every(
		(dep) => phaseStatus(dep - 1, item.currentPhase, item) === "done",
	);
	return ready ? "Queued" : undefined;
}
