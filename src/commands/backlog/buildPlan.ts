import type { PhaseRow, TaskRow } from "../../shared/db/schema";
import type { PlanPhase } from "./types";

function groupTasksByPhase(taskRows: TaskRow[]): Map<number, TaskRow[]> {
	const byPhase = new Map<number, TaskRow[]>();
	for (const t of taskRows) {
		const bucket = byPhase.get(t.phaseIdx);
		if (bucket) bucket.push(t);
		else byPhase.set(t.phaseIdx, [t]);
	}
	return byPhase;
}

function rowToPhase(p: PhaseRow, byPhase: Map<number, TaskRow[]>): PlanPhase {
	const phase: PlanPhase = {
		name: p.name,
		tasks: (byPhase.get(p.idx) ?? []).map((t) => ({ task: t.task })),
	};
	if (p.manualChecks) phase.manualChecks = JSON.parse(p.manualChecks);
	return phase;
}

/** Assemble the ordered plan phases from their rows and the phase's task rows. */
export function buildPlan(
	phaseRows: PhaseRow[],
	taskRows: TaskRow[],
): PlanPhase[] {
	const byPhase = groupTasksByPhase(taskRows);
	return phaseRows.map((p) => rowToPhase(p, byPhase));
}
