import type { BacklogDb } from "./openDb";
import type { PlanPhase } from "./types";

type PhaseRow = { idx: number; name: string; manual_checks: string | null };
type TaskRow = { task: string };

function toPhase(db: BacklogDb, itemId: number, p: PhaseRow): PlanPhase {
	const tasks = db
		.prepare(
			"SELECT task FROM plan_tasks WHERE item_id = ? AND phase_idx = ? ORDER BY idx",
		)
		.all(itemId, p.idx) as TaskRow[];

	const phase: PlanPhase = {
		name: p.name,
		tasks: tasks.map((t) => ({ task: t.task })),
	};
	if (p.manual_checks) {
		phase.manualChecks = JSON.parse(p.manual_checks);
	}
	return phase;
}

export function loadPlan(
	db: BacklogDb,
	itemId: number,
): PlanPhase[] | undefined {
	const phases = db
		.prepare(
			"SELECT idx, name, manual_checks FROM plan_phases WHERE item_id = ? ORDER BY idx",
		)
		.all(itemId) as PhaseRow[];

	if (phases.length === 0) return undefined;
	return phases.map((p) => toPhase(db, itemId, p));
}
