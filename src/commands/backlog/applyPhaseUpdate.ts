import type { BacklogDb } from "./openDb";

type PhaseUpdateFields = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
};

export function applyPhaseUpdate(
	db: BacklogDb,
	itemId: number,
	phaseIdx: number,
	fields: PhaseUpdateFields,
): void {
	const run = db.transaction(() => {
		if (fields.name) {
			db.prepare(
				"UPDATE plan_phases SET name = ? WHERE item_id = ? AND idx = ?",
			).run(fields.name, itemId, phaseIdx);
		}

		if (fields.manualCheck) {
			db.prepare(
				"UPDATE plan_phases SET manual_checks = ? WHERE item_id = ? AND idx = ?",
			).run(JSON.stringify(fields.manualCheck), itemId, phaseIdx);
		}

		if (fields.task) {
			db.prepare(
				"DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?",
			).run(itemId, phaseIdx);

			const stmt = db.prepare(
				"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
			);
			for (let i = 0; i < fields.task.length; i++) {
				stmt.run(itemId, phaseIdx, i, fields.task[i]);
			}
		}
	});
	run();
}
