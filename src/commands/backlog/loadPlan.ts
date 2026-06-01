import type { BacklogDb } from "./BacklogDb";
import type { PlanPhase } from "./types";

type PhaseRow = { idx: number; name: string; manual_checks: string | null };
type TaskRow = { task: string };

async function toPhase(
	db: BacklogDb,
	itemId: number,
	p: PhaseRow,
): Promise<PlanPhase> {
	const tasks = await db.all<TaskRow>(
		"SELECT task FROM plan_tasks WHERE item_id = ? AND phase_idx = ? ORDER BY idx",
		[itemId, p.idx],
	);

	const phase: PlanPhase = {
		name: p.name,
		tasks: tasks.map((t) => ({ task: t.task })),
	};
	if (p.manual_checks) {
		phase.manualChecks = JSON.parse(p.manual_checks);
	}
	return phase;
}

export async function loadPlan(
	db: BacklogDb,
	itemId: number,
): Promise<PlanPhase[] | undefined> {
	const phases = await db.all<PhaseRow>(
		"SELECT idx, name, manual_checks FROM plan_phases WHERE item_id = ? ORDER BY idx",
		[itemId],
	);

	if (phases.length === 0) return undefined;
	return Promise.all(phases.map((p) => toPhase(db, itemId, p)));
}
